# p1zza.kr 문서

현재 source repository는 [zeztto/p1zza.kr](https://github.com/zeztto/p1zza.kr), 공개 도메인은 [p1zza.kr](https://p1zza.kr/)입니다. 현재 구현과 운영 절차는 아래 문서에서 확인합니다.

| 문서                                           | 내용                                         |
| ---------------------------------------------- | -------------------------------------------- |
| [프로젝트 README](../README.md)                | 공개·관리자 기능, 개발, 콘텐츠 갱신          |
| [현재 구조와 운영](architecture.md)            | route·API·PostgreSQL·데이터 소유권·연결 범위 |
| [보안 운영](security.md)                       | 인증·입력 한도·dependency·최소 권한 계약     |
| [기여 안내](../CONTRIBUTING.md)                | 개발 환경과 변경·검증·PR 절차                |
| [유지보수 가이드](../guidelines/Guidelines.md) | 공개 콘텐츠와 운영 데이터·원본 보존 기준     |
| [배포 문서](../deploy/vultr/README.md)         | p1zza-2nd app 교체·백업·검증·rollback        |
| [출처와 라이선스](../ATTRIBUTIONS.md)          | 초기 scaffold와 현재 자산 출처 기록          |
| [변경 이력](../CHANGELOG.md)                   | 현재 변경과 당시 작성한 역사 기록            |

## 원본 보존 자료

2026-03-25의 설계·구현 계획 4개는 [`archive/docs-2026-03-25/`](../archive/docs-2026-03-25/README.md)로 이동했습니다. 원래 경로는 `docs/superpowers/{plans,specs}/`이며 byte·SHA-256과 Git blob을 [manifest](../archive/docs-2026-03-25/manifest.json)에 기록했습니다. 현재 계약과 당시 구상을 구분하기 위해 repository의 공통 원본 보존 경로인 `archive/`를 선택했습니다.

갱신 전 공개·초기 콘텐츠는 [`archive/content-2026-10-09/`](../archive/content-2026-10-09/manifest.json)에 별도로 보존합니다. 역사 문서와 보존 콘텐츠는 검색 치환·format 대상에서 제외합니다. 원문에 남은 이전 도메인, SQLite/Turso, 미완료 작업, 명령과 agent 지시는 당시 자료로 읽습니다.
