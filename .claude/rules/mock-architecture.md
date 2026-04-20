---
name: mock-architecture
description: Mock 아키텍처 규칙. 새 도메인은 src/mocks/ + mockBaseQuery.js 라우트 등록, 컴포넌트 직접 import 금지. 가변 데이터는 let 변수에서만 변경. Mock 데이터 추가·수정 시 적용.
---

# Mock 아키텍처 규칙

- **Mock 소스** — 새 도메인은 `src/mocks/` + `mockBaseQuery.js` 라우트 등록. 컴포넌트에서 `src/mocks/` 직접 import 금지.
- **Mock 변경** — 가변 데이터는 `mockBaseQuery.js` `let` 변수에서만 변경. `src/mocks/` 원본 배열 직접 변경 금지.
