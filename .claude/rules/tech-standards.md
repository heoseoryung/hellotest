---
name: tech-standards
description: 멍샵 기술 스택 & 보안 규칙. RTK Query 전용 HTTP, Pure JS, HttpOnly 쿠키 토큰 관리, Vite 환경변수, OAuth Secret 금지, SPA 네비게이션. 모든 작업에 항상 적용.
---

# 기술 스택 & 보안 규칙

- **No Axios** — 네트워크 요청은 RTK Query만.
- **Pure JS** — TypeScript 문법 금지.
- **No Token Storage** — 토큰을 localStorage·sessionStorage에 저장 금지.
- **Vite Env** — `import.meta.env` 사용.
- **withReauth** — baseQuery는 반드시 `withReauth`로 감싸기.
- **No OAuth Secret** — Client ID·Secret 프론트 코드 포함 금지.
- **SPA Nav** — 내부 이동은 `useNavigate`·`Link` 사용.
