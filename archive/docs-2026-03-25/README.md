# 2026-03-25 초기 설계 문서 보존

이 디렉터리는 당시 작성한 frontend·관리자 설계와 구현 계획 원문 4개를 보존합니다. 현재 구현 계약은 [현재 구조와 운영](../../docs/architecture.md), 현재 문서 목록은 [docs/README.md](../../docs/README.md)를 참고하세요.

## 원본과 보존 방법

원래 `docs/superpowers/{plans,specs}/`에 있던 파일을 `archive/docs-2026-03-25/{plans,specs}/`로 byte 그대로 이동했습니다. repository의 공통 원본 보존 경로인 `archive/`를 사용해 현재 문서와 구분했습니다. 기준 Git revision, 원래 경로·현재 경로, byte 수, SHA-256과 Git blob은 [manifest.json](manifest.json)에 기록했습니다.

| 원문 | 종류 |
| --- | --- |
| [관리자 구현 계획](plans/2026-03-25-admin-page-redesign.md) | 당시 단계별 작업 계획 |
| [Frontend 구현 계획](plans/2026-03-25-frontend-v2-redesign.md) | 당시 단계별 작업 계획 |
| [관리자 설계](specs/2026-03-25-admin-page-redesign.md) | 당시 요구·구상 |
| [Frontend 설계](specs/2026-03-25-frontend-v2-redesign.md) | 당시 요구·구상 |

## 읽는 기준

원문에는 당시의 SQLite/Turso 예시, 미완료 작업 목록, blog·gradient 구상과 header/footer 편집·autosave 계획이 포함되어 있습니다. 현재 runtime과 실제 화면 연결 상태는 현행 구조 문서에서 확인합니다. 원문의 명령과 agent 지시는 역사 자료로 취급하며 현재 작업 권한이나 구현 완료 증거로 실행하지 않습니다.

제목·문장·코드·체크 목록·줄바꿈을 최신 내용으로 수정하지 않습니다. 원문을 검색 치환이나 format하지 않고 `manifest.json`의 byte 수·SHA-256과 기준 Git blob을 대조해 보존 여부를 확인합니다. 원문 안의 경로·링크는 작성 당시의 맥락을 유지합니다.
