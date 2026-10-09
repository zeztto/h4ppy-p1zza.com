import assert from 'node:assert/strict';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { build } from 'esbuild';
import { getSafeExternalUrl } from '../src/app/lib/safe-external-url.js';
import { INQUIRY_FIELD_LIMITS } from '../src/shared/inquiry-contract.js';

interface TestNode {
  type: unknown;
  props: Record<string, unknown>;
}

interface AuthValue {
  user: unknown;
  isAuthenticated: boolean;
  isLoggingOut: boolean;
  logoutError: string | null;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
}

async function authHarness(logoutStatus: number | 'network-error') {
  let currentStatus = logoutStatus;
  const values: unknown[] = [];
  let index = 0;
  const navigations: string[] = [];
  let logoutCalls = 0;
  const user = { id: 'test-admin', githubLogin: 'test-admin', displayName: '테스트', avatarUrl: null, role: 'admin' };
  const output = await build({
    entryPoints: ['src/app/admin/AuthContext.tsx'],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    write: false,
    jsx: 'automatic',
    plugins: [{
      name: 'test-react-hooks',
      setup(builder) {
        builder.onResolve({ filter: /^react(?:\/jsx-runtime)?$/ }, ({ path }) => ({ path, namespace: 'test-react' }));
        builder.onLoad({ filter: /.*/, namespace: 'test-react' }, ({ path }) => ({
          loader: 'js',
          contents: path === 'react'
            ? 'export const createContext=()=>({Provider:"provider"}); export const useState=(initial)=>globalThis.__useState(initial); export const useCallback=(fn)=>fn; export const useEffect=()=>{}; export const useContext=()=>null;'
            : 'export const jsx=(type,props)=>({type,props}); export const jsxs=jsx;',
        }));
      },
    }],
  });
  const sandbox = {
    module: { exports: {} },
    exports: {},
    Headers, FormData,
    __useState(initial: unknown) {
      const slot = index++;
      if (!(slot in values)) values[slot] = initial;
      return [values[slot], (value: unknown) => { values[slot] = value; }];
    },
    fetch: async (url: string) => {
      if (url === '/api/auth/session') return Response.json({ authenticated: true, user });
      assert.equal(url, '/api/auth/logout');
      logoutCalls++;
      if (currentStatus === 'network-error') throw new TypeError('network disconnected');
      return currentStatus === 204
        ? new Response(null, { status: 204 })
        : Response.json({ error: '로그아웃을 완료하지 못했습니다. 다시 시도해주세요.' }, { status: currentStatus });
    },
    window: { location: { assign: (path: string) => { navigations.push(path); } } },
  };
  runInNewContext(output.outputFiles[0]!.text, sandbox);
  const component = (sandbox.module.exports as { AuthProvider: (props: { children: null }) => TestNode }).AuthProvider;
  function render() {
    index = 0;
    return component({ children: null }).props['value'] as AuthValue;
  }
  await render().refreshSession();
  return { render, navigations, logoutCalls: () => logoutCalls, setLogoutStatus: (status: number) => { currentStatus = status; } };
}

for (const status of ['network-error', 500, 403, 200] as const) {
  test(`logout ${status} retains the authenticated user and reports retryable failure`, async () => {
    const harness = await authHarness(status);
    const user = harness.render().user;
    await harness.render().logout();
    const result = harness.render();
    assert.equal(result.user, user);
    assert.equal(result.isAuthenticated, true);
    assert.equal(result.isLoggingOut, false);
    assert.match(result.logoutError ?? '', /로그아웃.*다시 시도/);
    assert.deepEqual(harness.navigations, []);
    assert.equal(harness.logoutCalls(), 1);
  });
}

test('logout 204 clears the authenticated user and navigates to login', async () => {
  const harness = await authHarness(204);
  await harness.render().logout();
  assert.equal(harness.render().user, null);
  assert.deepEqual(harness.navigations, ['/admin/login']);
  assert.equal(harness.logoutCalls(), 1);
});

test('administrator can retry a failed logout and clear the error only after 204', async () => {
  const harness = await authHarness(500);
  const failed = harness.render().logout();
  assert.equal(harness.render().isLoggingOut, true);
  await failed;
  assert.ok(harness.render().logoutError);
  harness.setLogoutStatus(204);
  await harness.render().logout();
  assert.equal(harness.render().logoutError, null);
  assert.equal(harness.render().user, null);
  assert.equal(harness.logoutCalls(), 2);
  assert.deepEqual(harness.navigations, ['/admin/login']);
});

test('safe URL helper allows absolute HTTP(S) links and rejects unsafe navigation', () => {
  assert.equal(getSafeExternalUrl('https://example.org/inquiry?q=한글'), 'https://example.org/inquiry?q=%ED%95%9C%EA%B8%80');
  assert.equal(getSafeExternalUrl('http://example.org/'), 'http://example.org/');
  for (const unsafe of [
    'javascript:alert(1)', 'JaVaScRiPt:void(0)', 'data:text/html,audit', 'vbscript:audit',
    'ftp://example.org/', '/inquiry', '//example.org/', 'invalid URL',
    'https://user:password@example.org/', 'https://user@example.org/',
    'https://example.org/\npath', '\t https://example.org/', 'https://example.org/\u007f',
    'https://example.org/%0apath', 'https://example.org/%1f',
  ]) assert.equal(getSafeExternalUrl(unsafe), null, unsafe);
});

function nodes(tree: unknown): TestNode[] {
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  if (!tree || typeof tree !== 'object' || !('props' in tree)) return [];
  const node = tree as TestNode;
  if (typeof node.type === 'function') return nodes(node.type(node.props));
  return [node, ...nodes(node.props['children'])];
}

function textContent(tree: unknown): string {
  if (Array.isArray(tree)) return tree.map(textContent).join('');
  if (typeof tree === 'string' || typeof tree === 'number') return String(tree);
  if (!tree || typeof tree !== 'object' || !('props' in tree)) return '';
  const node = tree as TestNode;
  return typeof node.type === 'function' ? textContent(node.type(node.props)) : textContent(node.props['children']);
}

async function uiHarness(entry: string, initialValues: unknown[], response: Response | Error = Response.json({ ok: true })) {
  const values = [...initialValues];
  let index = 0;
  const requests: Array<{ url: string; init: RequestInit }> = [];
  const auth = { user: { githubLogin: 'test-admin', displayName: '테스트', avatarUrl: null }, logout: async () => {}, isLoggingOut: false, logoutError: '로그아웃을 완료하지 못했습니다. 다시 시도해주세요.' };
  const stubs: Record<string, string> = {
    react: 'export const useState=(initial)=>globalThis.__useState(initial); export const useEffect=()=>{}; export const useCallback=(fn)=>fn; export const useMemo=(fn)=>fn(); export const useRef=()=>({current:null});',
    'react/jsx-runtime': 'export const jsx=(type,props)=>({type,props}); export const jsxs=jsx; export const Fragment="fragment";',
    'motion/react': 'export const motion={div:"div"};',
    'react-router-dom': 'export const Link="a",Outlet="main"; export const useLocation=()=>({pathname:"/admin"});',
    'lucide-react': 'export const Send="icon",CheckCircle="icon",AlertCircle="icon",Building2="icon",Mail="icon",Phone="icon",User="icon",FileText="icon",Clock="icon",Wallet="icon",Clock3="icon",RefreshCw="icon",LayoutDashboard="icon",FolderKanban="icon",Layers="icon",Inbox="icon",Menu="icon",X="icon";',
    '@/app/components/ui/button': 'export const Button="button";',
    '@/app/components/ui/badge': 'export const Badge="span";',
    '@/app/components/ui/card': 'export const Card="section",CardContent="div",CardHeader="header";',
    '@/app/admin/AuthContext': 'export const useAuth=()=>globalThis.__auth;',
    '@/app/admin/services/api': 'export const getInquiries=async()=>[]; export const updateInquiryStatus=async()=>{};',
  };
  const output = await build({
    entryPoints: [entry], bundle: true, platform: 'node', format: 'cjs', write: false, jsx: 'automatic',
    define: { 'import.meta.env': JSON.stringify({ VITE_TURNSTILE_SITE_KEY: 'test-site-key' }) },
    plugins: [{ name: 'test-ui-boundaries', setup(builder) {
      builder.onResolve({ filter: /.*/ }, ({ path }) => Object.hasOwn(stubs, path) ? { path, namespace: 'test-ui' } : undefined);
      builder.onLoad({ filter: /.*/, namespace: 'test-ui' }, ({ path }) => ({ loader: 'js', contents: stubs[path]! }));
    } }],
  });
  const sandbox = {
    module: { exports: {} }, exports: {}, URL, Error, TypeError, console,
    __auth: auth,
    __useState(initial: unknown) {
      const slot = index++;
      if (!(slot in values)) values[slot] = initial;
      return [values[slot], (value: unknown) => { values[slot] = typeof value === 'function' ? value(values[slot]) : value; }];
    },
    window: { location: { href: 'https://p1zza.kr/inquiry' } },
    fetch: async (url: string, init: RequestInit) => {
      requests.push({ url, init });
      if (response instanceof Error) throw response;
      return response;
    },
  };
  runInNewContext(output.outputFiles[0]!.text, sandbox);
  const exports = sandbox.module.exports as Record<string, () => TestNode>;
  const component = exports['InquiryPage'] ?? exports['AdminLayout'] ?? exports['default'];
  assert.ok(component);
  return {
    requests, auth,
    render() { index = 0; return component(); },
    async submit() {
      index = 0;
      const form = nodes(component()).find(node => node.type === 'form');
      assert.ok(form);
      (form.props['onSubmit'] as (event: { preventDefault: () => void }) => void)({ preventDefault() {} });
      await new Promise<void>(resolve => setImmediate(resolve));
    },
  };
}

const validForm = { name: '문의 테스트', email: 'inquiry@example.org', phone: '', company: '', projectType: '웹사이트 제작', budget: '', timeline: '', description: '테스트에서만 사용하는 문의 내용입니다.' };

test('normal inquiry preserves its form payload and applies input limits', async () => {
  const harness = await uiHarness('src/app/pages/inquiry/InquiryPage.tsx', [validForm, 'test-token', 'idle', '']);
  const controls = nodes(harness.render());
  for (const field of ['name', 'email', 'phone', 'company', 'description'] as const) {
    assert.equal(controls.find(node => node.props['name'] === field)?.props['maxLength'], INQUIRY_FIELD_LIMITS[field]);
  }
  await harness.submit();
  assert.equal(harness.requests.length, 1);
  assert.equal(harness.requests[0]!.url, '/api/inquiries');
  assert.deepEqual(JSON.parse(harness.requests[0]!.init.body as string), { ...validForm, sourceUrl: 'https://p1zza.kr/inquiry', turnstileToken: 'test-token' });
  assert.match(textContent(harness.render()), /제출 완료/);
});

test('inquiry validates raw length before trimming and keeps the form on overflow', async () => {
  const harness = await uiHarness('src/app/pages/inquiry/InquiryPage.tsx', [{ ...validForm, name: ' '.repeat(INQUIRY_FIELD_LIMITS.name) + '이름' }, 'test-token', 'idle', '']);
  await harness.submit();
  assert.equal(harness.requests.length, 0);
  const alert = nodes(harness.render()).find(node => node.props['role'] === 'alert');
  assert.ok(alert);
  assert.match(textContent(alert), /120자 이하/);
});

for (const [status, message] of [[400, '이메일은 254자 이하로 입력해주세요.'], [503, '보안 인증을 확인할 수 없습니다. 잠시 후 다시 시도해주세요.']] as const) {
  test(`inquiry ${status} displays the backend error and preserves entered values`, async () => {
    const harness = await uiHarness('src/app/pages/inquiry/InquiryPage.tsx', [validForm, 'test-token', 'idle', ''], Response.json({ error: message }, { status }));
    await harness.submit();
    const tree = harness.render();
    assert.equal(textContent(nodes(tree).find(node => node.props['role'] === 'alert')), message);
    assert.equal(nodes(tree).find(node => node.props['name'] === 'description')?.props['value'], validForm.description);
  });
}

test('network inquiry failure displays Korean retry guidance', async () => {
  const harness = await uiHarness('src/app/pages/inquiry/InquiryPage.tsx', [validForm, 'test-token', 'idle', ''], new TypeError('Failed to fetch'));
  await harness.submit();
  assert.match(textContent(nodes(harness.render()).find(node => node.props['role'] === 'alert')), /연결을 확인하고 다시 시도/);
});

test('administrator receives a visible logout retry and disabled pending button', async () => {
  const harness = await uiHarness('src/app/layouts/AdminLayout.tsx', [false]);
  assert.match(textContent(harness.render()), /로그아웃 다시 시도/);
  assert.match(textContent(nodes(harness.render()).find(node => node.props['role'] === 'alert')), /로그아웃.*다시 시도/);
  harness.auth.isLoggingOut = true;
  const button = nodes(harness.render()).find(node => node.type === 'button' && textContent(node) === '로그아웃 중...');
  assert.ok(button);
  assert.equal(button.props['disabled'], true);
  assert.equal(button.props['aria-busy'], true);
});

for (const sourceUrl of ['javascript:alert(1)', 'data:text/html,audit', 'https://user:secret@example.org/', 'https://example.org/path']) {
  test(`saved inquiry source URL renders safely: ${sourceUrl}`, async () => {
    const fixture = { id: 'test-inquiry', name: '테스트 문의', email: 'inquiry@example.org', phone: '', company: '', projectType: '', budget: '', timeline: '', description: '', status: 'new', sourceUrl, userAgent: '', ipAddress: '', createdAt: '2026-10-09T00:00:00Z', updatedAt: '2026-10-09T00:00:00Z', resolvedAt: null };
    const harness = await uiHarness('src/app/pages/admin/InquiriesPage.tsx', [[fixture], false, null, 'all', null]);
    const tree = harness.render();
    const anchor = nodes(tree).find(node => node.type === 'a' && textContent(node) === sourceUrl);
    if (sourceUrl === 'https://example.org/path') {
      assert.equal(anchor?.props['href'], sourceUrl);
      assert.equal(anchor?.props['rel'], 'noopener noreferrer');
    } else assert.equal(anchor, undefined);
    assert.ok(textContent(tree).includes(sourceUrl));
  });
}
