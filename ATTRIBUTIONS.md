# 출처와 라이선스

이 프로젝트의 초기 화면 scaffold는 Figma Make에서 시작했습니다. 현재 운영하는 p1zza.kr의 외부 구성 요소와 자산 출처 기록을 이 문서에 보존합니다. 프로젝트 자체의 라이선스는 [MIT License](LICENSE)입니다.

## 초기 scaffold의 출처 기록

- [shadcn/ui](https://ui.shadcn.com/) 구성 요소는 원래 출처 문서에서 [MIT license](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md)로 사용한 것으로 기록되어 있습니다.
- [Unsplash](https://unsplash.com) 사진은 원래 출처 문서에서 [Unsplash license](https://unsplash.com/license)로 사용한 것으로 기록되어 있습니다.

이 항목들은 초기 scaffold의 원출처 기록입니다. 현재 자산의 개별 원본과 사용 근거는 자산을 추가·교체할 때 함께 확인하고 기록합니다.

## 현재 자산 관리

프로필과 기존 이미지 URL 참조는 [Cloudinary 자산 목록](src/data/cloudinary-assets.ts)에 있습니다. 프로젝트 썸네일과 소개는 운영 DB에서 관리하며 새 DB의 초기값은 [프로젝트 데이터](src/data/projects.ts)에 있습니다. 실제 공개 서비스 캡처, OG 이미지와 공개 release 이미지를 사용하는 경우에도 해당 원출처와 사용 권한을 유지합니다.

보존한 콘텐츠의 원래 자산 참조는 [콘텐츠 archive manifest](archive/content-2026-10-09/manifest.json)에서 확인할 수 있습니다. repository 이름 변경은 LICENSE의 작가 이름·연도나 기존 자산 출처를 변경하지 않습니다.
