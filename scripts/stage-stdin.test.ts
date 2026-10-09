import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

interface ComposeCommand {
  line: number;
  operation: 'run' | 'exec';
  source: string;
}

interface DockerObservation {
  arguments: string[];
  stdin: string;
  stdinIsNull: boolean;
}

const stdinConsumerScript = `#!${process.execPath} --
const fs = require('node:fs');
const stdin = fs.readFileSync(0, 'utf8');
const inputDevice = fs.fstatSync(0);
const nullDevice = fs.statSync('/dev/null');
const stdinIsNull = inputDevice.isCharacterDevice() && inputDevice.rdev === nullDevice.rdev;
fs.appendFileSync(process.env['DOCKER_OBSERVATION'], JSON.stringify({ arguments: process.argv.slice(2), stdin, stdinIsNull }) + '\\n', { mode: 0o600 });
process.stdout.write('synthetic-docker-output\\n');
`;

const repository = fileURLToPath(new URL('../', import.meta.url));
const stagePath = path.join(repository, 'deploy/vultr/stage.sh');
const sourceRef = process.env['STAGE_STDIN_SOURCE_REF'];

// A hexadecimal Git ref lets the same behavioral test preserve the pre-fix RED proof.
assert.ok(sourceRef === undefined || /^[a-f0-9]{4,40}$/i.test(sourceRef));
const stageSource = sourceRef
  ? execFileSync('git', ['show', `${sourceRef}:deploy/vultr/stage.sh`], {
      cwd: repository,
      encoding: 'utf8',
    })
  : fs.readFileSync(stagePath, 'utf8');

function composeCommands(source: string): ComposeCommand[] {
  const lines = source.split('\n');
  const commands: ComposeCommand[] = [];
  for (let index = 0; index < lines.length; index += 1) {
    const firstLine = lines[index]!;
    const match = /^\s*docker compose\b.*?\s(run|exec)(?:\s|$)/.exec(firstLine);
    if (!match) continue;
    const start = index;
    while (lines[index]!.trimEnd().endsWith('\\')) {
      index += 1;
      assert.ok(index < lines.length, 'stage.sh contains an unterminated Compose command');
    }
    commands.push({
      line: start + 1,
      operation: match[1] as ComposeCommand['operation'],
      source: lines.slice(start, index + 1).join('\n'),
    });
  }
  return commands;
}

const commands = composeCommands(stageSource);

test('stage command inventory covers bootstrap, both readiness checks, migration and exec health', () => {
  assert.equal(commands.filter((command) => command.operation === 'run').length, 4);
  assert.equal(commands.filter((command) => command.operation === 'exec').length, 1);
});

for (const command of commands) {
  test(`stage.sh:${command.line} Compose ${command.operation} preserves Bash -s continuation`, () => {
    const directory = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'p1zza-stage-stdin-'));
    const bin = path.join(directory, 'bin');
    const backup = path.join(directory, 'backup');
    const observationPath = path.join(directory, 'docker-observation.json');
    const marker = path.join(directory, 'after-compose');
    try {
      fs.chmodSync(directory, 0o700);
      fs.mkdirSync(bin, { mode: 0o700 });
      fs.mkdirSync(backup, { mode: 0o700 });
      fs.writeFileSync(path.join(bin, 'docker'), stdinConsumerScript, { mode: 0o700 });
      // Only the extracted Docker block runs. The fake consumes fd 0 exactly as an
      // interactive client would; neither its Compose arguments nor Node -e code run.
      const result = spawnSync('/bin/bash', ['-s'], {
        cwd: directory,
        encoding: 'utf8',
        timeout: 10_000,
        input: `set -euo pipefail\nbackup="$TEST_BACKUP"\n${command.source}\nprintf '%s' 'continuation-preserved' > "$STAGE_MARKER"\n`,
        env: {
          PATH: `${bin}${path.delimiter}/usr/bin${path.delimiter}/bin`,
          TEST_BACKUP: backup,
          DOCKER_OBSERVATION: observationPath,
          STAGE_MARKER: marker,
        },
      });
      assert.ifError(result.error);
      assert.equal(result.status, 0, result.stderr);
      assert.ok(fs.existsSync(observationPath), 'the extracted Compose command did not execute');
      const observation = JSON.parse(fs.readFileSync(observationPath, 'utf8')) as DockerObservation;
      assert.equal(observation.arguments[0], 'compose');
      assert.ok(observation.arguments.includes(command.operation));
      assert.ok(observation.arguments.includes('-T'), 'Compose must disable TTY allocation');
      assert.ok(
        observation.arguments.includes('--interactive=false'),
        'Compose must explicitly disable interactive stdin'
      );
      const markerExists = fs.existsSync(marker);
      assert.equal(
        observation.stdin,
        '',
        `Docker consumed the Bash -s continuation: exit=${result.status}, marker=${markerExists}`
      );
      assert.equal(markerExists, true, 'Bash -s stopped before the command after Compose');
      assert.equal(observation.stdinIsNull, true, 'Compose stdin must be the /dev/null device');
      assert.equal(fs.readFileSync(marker, 'utf8'), 'continuation-preserved');

      const backupOutput = />\s*"\$backup\/([^"\n]+)"/.exec(command.source)?.[1];
      if (backupOutput) {
        assert.equal(
          fs.readFileSync(path.join(backup, backupOutput), 'utf8'),
          'synthetic-docker-output\n'
        );
      } else {
        assert.equal(result.stdout, 'synthetic-docker-output\n');
      }
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });
}

test('additive bootstrap executes before candidate readiness in the actual command order', () => {
  const directory = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'p1zza-stage-stdin-'));
  const bin = path.join(directory, 'bin');
  const backup = path.join(directory, 'backup');
  const observationPath = path.join(directory, 'docker-observation.jsonl');
  const marker = path.join(directory, 'after-readiness');
  try {
    fs.chmodSync(directory, 0o700);
    fs.mkdirSync(bin, { mode: 0o700 });
    fs.mkdirSync(backup, { mode: 0o700 });
    fs.writeFileSync(path.join(bin, 'docker'), stdinConsumerScript, { mode: 0o700 });
    const firstCommands = commands
      .slice(0, 2)
      .map((command) => command.source)
      .join('\n');
    const result = spawnSync('/bin/bash', ['-s'], {
      cwd: directory,
      encoding: 'utf8',
      timeout: 10_000,
      input: `set -euo pipefail\nbackup="$TEST_BACKUP"\n${firstCommands}\nprintf '%s' 'readiness-reached' > "$STAGE_MARKER"\n`,
      env: {
        PATH: `${bin}${path.delimiter}/usr/bin${path.delimiter}/bin`,
        TEST_BACKUP: backup,
        DOCKER_OBSERVATION: observationPath,
        STAGE_MARKER: marker,
      },
    });
    assert.ifError(result.error);
    assert.equal(result.status, 0, result.stderr);
    const observations = fs
      .readFileSync(observationPath, 'utf8')
      .trimEnd()
      .split('\n')
      .map((line) => JSON.parse(line) as DockerObservation);
    assert.equal(observations.length, 2, 'both bootstrap and readiness commands must execute');
    const bootstrap = observations[0]!.arguments;
    const readiness = observations[1]!.arguments;
    assert.ok(bootstrap.includes('run'));
    assert.equal(
      bootstrap.at(-1),
      'migration',
      'candidate readiness ran before additive migration'
    );
    assert.ok(readiness.includes('run'));
    assert.ok(readiness.includes('app'));
    assert.ok(readiness.includes('node'), 'the candidate readiness command must follow bootstrap');
    assert.equal(fs.readFileSync(marker, 'utf8'), 'readiness-reached');
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

// Run only the caller's final Python heredoc, not the remote deployment body.
const callerSource = stageSource.split('\nREMOTE\n').at(-1)!;
const completionGate =
  /^python3 - "\$LOCAL_STAGE\/remote-release\.log" "\$REVISION" <<'PY'\n([\s\S]*?)\nPY\s*$/m.exec(
    callerSource
  )?.[1];
const releaseRevision = 'a'.repeat(40);
const releaseMarker = `P1ZZA_RELEASE_COMPLETE:${releaseRevision}`;
const completionCases = [
  { name: 'empty remote output', output: '', accepts: false },
  { name: 'SSH exit 0 output without a marker', output: 'Phase: readiness\n', accepts: false },
  {
    name: 'a marker for the wrong revision',
    output: `P1ZZA_RELEASE_COMPLETE:${'b'.repeat(40)}\n`,
    accepts: false,
  },
  {
    name: 'duplicate expected markers',
    output: `${releaseMarker}\n${releaseMarker}\n`,
    accepts: false,
  },
  {
    name: 'output after the completion marker',
    output: `${releaseMarker}\nPhase: unfinished\n`,
    accepts: false,
  },
  {
    name: 'a marker embedded in another line',
    output: `prefix-${releaseMarker}\n`,
    accepts: false,
  },
  { name: 'one exact final revision marker', output: `${releaseMarker}\n`, accepts: true },
  {
    name: 'phase logs followed by one exact final marker',
    output: `Phase: readiness\nPreservation: PASS\n${releaseMarker}\n`,
    accepts: true,
  },
];

for (const item of completionCases) {
  test(`caller completion gate ${item.accepts ? 'accepts' : 'rejects'} ${item.name}`, () => {
    assert.ok(completionGate, 'stage.sh lacks its final caller completion gate');
    const directory = fs.mkdtempSync(
      path.join(fs.realpathSync(os.tmpdir()), 'p1zza-stage-marker-')
    );
    try {
      fs.chmodSync(directory, 0o700);
      const outputFile = path.join(directory, 'remote-release.log');
      fs.writeFileSync(outputFile, item.output, { mode: 0o600 });
      const result = spawnSync('python3', ['-', outputFile, releaseRevision], {
        cwd: directory,
        encoding: 'utf8',
        timeout: 10_000,
        input: completionGate,
        env: { PATH: '/usr/bin:/bin' },
      });
      assert.ifError(result.error);
      assert.equal(result.signal, null);
      assert.equal(result.stdout, '');
      assert.equal(result.status, item.accepts ? 0 : 1, result.stderr);
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });
}
