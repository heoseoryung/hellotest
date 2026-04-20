# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 작업 시작 전 필독 순서 (Docs First)

1. `.claude/rules/` — `tech-standards`, `mock-architecture`, `doc-sync` 확인
2. `.claude/skills/{관련스킬}/SKILL.md` — 작업 유형별 구체적 패턴 확인
3. `docs/domain/{관련도메인}.md` — 비즈니스 명세 확인
4. 수정할 파일을 Read 도구로 먼저 읽기

> 코드 한 줄 작성 전에 관련 docs를 먼저 읽고 업데이트하는 것이 절대 원칙이다 (`.claude/rules/doc-sync.md`).

---

## Commands

```bash
npm run dev        # 개발 서버 (Vite)
npm run build      # 프로덕션 빌드
npm run preview    # 빌드 결과 미리보기
npm run lint       # ESLint
```

`.env.example`을 `.env`로 복사 후 `VITE_API_BASE_URL` 설정 (기본값: `http://localhost:8080/api`).

---

## 불변 규칙 (`.claude/rules/tech-standards.md`)

| 규칙 | 내용 |
|---|---|
| **No Axios** | HTTP 통신은 RTK Query만 (`fetchBaseQuery` / `mockBaseQuery`) |
| **Pure JS** | TypeScript 문법 금지 (`.ts`, `.tsx` 파일 생성 금지) |
| **No Token Storage** | 토큰을 `localStorage` · `sessionStorage`에 저장 금지 — HttpOnly 쿠키 사용 |
| **withReauth** | `baseQuery`는 반드시 `withReauth`로 감싸기 |
| **No OAuth Secret** | Client ID · Secret 프론트 코드 포함 금지 |
| **SPA Nav** | 내부 이동은 `useNavigate` · `<Link>` 사용 (`window.location.href` 금지) |
| **Vite Env** | 환경변수는 `import.meta.env.VITE_*` 사용 |

---

## 목표 아키텍처 (Feature-based Design)

```
src/
├── features/               도메인별 자급자족 단위
│   ├── auth/               authApi.js, authSlice.js, AuthInitializer.jsx, ProtectedRoute.jsx
│   ├── products/           productsApi.js, ProductCard.jsx, ProductListPage.jsx
│   ├── cart/               cartApi.js, CartPage.jsx
│   ├── orders/             ordersApi.js, OrdersPage.jsx
│   ├── reviews/            reviewsApi.js
│   ├── user/               usersApi.js, pointsApi.js
│   └── mypage/             MyPageLayout.jsx (LNB 사이드바 + Dashboard)
├── shared/
│   ├── components/         ErrorBoundary, Spinner, Toast
│   └── utils/              constants.js, formatters.js, cookies.js, oauth2.js
├── api/
│   ├── apiSlice.js         createApi + withReauth (인프라 전용, 수정 금지)
│   └── mockBaseQuery.js    Mock 전용 baseQuery (URL 라우터)
├── app/
│   └── store.js
├── components/layout/      Header, Footer, Layout
└── mocks/                  도메인별 원본 데이터 (컴포넌트 직접 import 금지)
```

> 자세한 라우팅 트리·컴포넌트 계층은 `.claude/skills/app-structure/SKILL.md` 참조.

---

## RTK Query 패턴

- **단일 createApi** — `src/api/apiSlice.js`에서만 `createApi()` 호출
- **injectEndpoints 분리** — 도메인별 `src/features/{domain}/{domain}Api.js`
- 새 도메인 추가 시 `apiSlice.js`의 `tagTypes` 배열에 타입 추가 필수
- `store.js`에 도메인 Api 파일 import 필수 (import만 하면 됨)

> 캐시 태그 전략·훅 명명 규칙은 `.claude/skills/rtk-query-api/SKILL.md` 참조.

---

## Mock 아키텍처

```
컴포넌트 → RTK Query 훅 → apiSlice (withReauth) → mockBaseQuery → src/mocks/
```

- `src/mocks/` 파일을 컴포넌트에서 직접 import 금지
- 가변 데이터는 `mockBaseQuery.js`의 `let` 변수에서만 수정 (원본 배열 직접 변경 금지)
- Mock → 실서버 전환: `apiSlice.js`에서 `mockBaseQuery` → `realBaseQuery` 한 줄만 교체

> 상세 규칙·절차는 `.claude/skills/mock-architecture/SKILL.md` 참조.

---

## Redux Store 구조

```js
{
  api: { ... },     // 단일 RTK Query 캐시 (apiSlice.reducerPath)
  auth: {
    user: null | { id, email, name, phone, role, provider },
    isInitialized: boolean,   // AuthInitializer 완료 신호
  }
}
```

Redux slice는 UI 상태·전역 클라이언트 상태에만 사용. 서버 데이터는 RTK Query 캐시에만 저장.

---

## 인증 구조 요약

```
브라우저                      서버
POST /auth/login  ──────►   set-cookie: access_token (HttpOnly)
◄── { user } ──────────                refresh_token (HttpOnly)
                                        XSRF-TOKEN (JS readable)

Redux: { user } 만 저장. 토큰 절대 저장 금지.
```

> 상세 패턴(withReauth, AuthInitializer, ProtectedRoute, OAuth2)은 `.claude/skills/auth-security/SKILL.md` 참조.

---

## 스타일링

Tailwind CSS v4`tailwind.config.js` 없음 — `src/index.css`에서 설정.


- 인라인 `style={}` 속성 금지
- 모바일 퍼스트 (`grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`)

> 컴포넌트 클래스 목록·상태별 UI 패턴은 `.claude/skills/styling/SKILL.md` 참조.

---

## 문서 동기화 규칙

비즈니스 로직(배송비, 포인트율, 주문 상태값 등) 변경 시 `docs/domain/*.md` 자동 갱신 필수.  
완료 보고 시 수정된 코드 + 문서 변경 내역을 함께 기술.

> 트리거 기준·보고 형식은 `.claude/skills/auto-doc-sync/SKILL.md` 참조.

---

## 현재 구현 vs. 목표 아키텍처 간 주요 괴리

현재 코드는 아직 목표 아키텍처로 이행 중이다. 작업 전 아래 사항을 인지할 것:

| 항목 | 현재 코드 | 목표 |
|---|---|---|
| 토큰 저장 | `localStorage` + Redux state | HttpOnly 쿠키만 |
| API 구조 | 도메인별 `createApi` 다중 호출 | 단일 `apiSlice` + `injectEndpoints` |
| Mock 접근 | 컴포넌트에서 `src/mock/` 직접 import | `mockBaseQuery.js` 경유 |
| 인증 슬라이스 | `setCredentials / clearCredentials / setToken` | `setUser / setInitialized / logout` |
| 디렉토리 | flat (`src/pages/`, `src/features/components/`) | Feature-based (`src/features/{domain}/`) |
| 비즈니스 상수 | 컴포넌트 내 하드코딩 | `src/shared/utils/constants.js` |
