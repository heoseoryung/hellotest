---
name: dev-standards
description: "멍샵 프로젝트의 개발 표준. 기술 스택 고정값(React 19, RTK Query, Vite), Pure JS 적용 범위, Vite 환경변수 네이밍 규칙, 폴더 구조 및 파일 네이밍 컨벤션을 정의한다. TRIGGER when: 새 파일이나 컴포넌트를 생성할 때, 라이브러리 선택이나 기술 스택을 결정할 때, 환경변수를 추가하거나 참조할 때, 프로젝트 폴더 구조나 파일명을 결정할 때, 코드 스타일이나 컨벤션이 불확실할 때. Do NOT use for: auth-security·auto-doc-sync 스킬이 담당하는 인증·문서 동기화 작업."
user-invocable: false
---

# 개발 표준 (Dev Standards)

모든 작업 시작 전 이 문서를 기준으로 기술 스택과 불변 규칙을 확인한다.

---

## 기술 스택 (고정)

| 영역 | 기술 | 비고 |
|---|---|---|
| UI 라이브러리 | React 19 | JSX |
| 번들러 | Vite | `vite.config.js` |
| 상태 관리 | Redux Toolkit + RTK Query | |
| 스타일링 | Tailwind CSS v4 + daisyUI v5 (거의 비활성화) | `src/index.css` |
| 라우팅 | React Router DOM v7 | `src/router.jsx` |
| 언어 | **JavaScript (JSX)** — TypeScript 금지 | |
| HTTP | **RTK Query (fetchBaseQuery)** — Axios 금지 | |
| 경로 별칭 | `@/` → `src/` | `vite.config.js` |

---

## 언어 규칙 (Pure JS)

```js
// ✅ 올바른 JavaScript
const fetchUser = async (id) => {
  const { data } = await getUser(id)
  return data
}

// ❌ TypeScript 문법 — 절대 사용 금지
const fetchUser = async (id: number): Promise<User> => { ... }
type UserState = { user: User | null }
interface ApiResponse<T> { data: T }
```

- `.ts`, `.tsx` 파일 생성 금지
- JSDoc 타입 주석(`/** @param {number} id */`)은 허용하나 강제하지 않음

---

## 네트워크 규칙 (No Axios)

```js
// ✅ RTK Query 훅으로만 데이터 페칭
const { data, isLoading } = useSearchProductsQuery({ category: 'SNACK_JERKY' })
const [createOrder] = useCreateOrderMutation()

// ❌ 절대 사용 금지
import axios from 'axios'
axios.get('/products')
fetch('/api/products')    // RTK Query 외부에서 직접 fetch 금지
```

---

## 환경 변수 (Vite Env)

```js
// ✅
const apiUrl = import.meta.env.VITE_API_BASE_URL

// ❌
const apiUrl = process.env.REACT_APP_API_URL  // CRA 방식
const apiUrl = process.env.VITE_API_BASE_URL  // Node 방식
```

- 모든 클라이언트 환경 변수는 `VITE_` 접두어 필수
- 시크릿(API Key, OAuth Client Secret) `.env` 포함 금지

```bash
# .env
VITE_API_BASE_URL=http://localhost:8072/api/v1
```

---

## 보안 금지 사항

```js
// ❌ 토큰 로컬 저장 — 절대 금지
localStorage.setItem('access_token', token)
sessionStorage.setItem('refresh_token', token)

// ❌ OAuth Client Secret — 절대 금지
const CLIENT_SECRET = 'secret'

// ❌ window.location.href 내부 라우팅에 사용
window.location.href = '/mypage'   // OAuth 리다이렉트 제외
```

---

## SPA 네비게이션

```jsx
// ✅
import { useNavigate, Link } from 'react-router-dom'
const navigate = useNavigate()
navigate('/order/list')
<Link to="/product/list">상품 목록</Link>

// ❌
window.location.href = '/order/list'   // 외부 OAuth 리다이렉트 제외하고 금지
<a href="/product/list">상품 목록</a>  // 내부 라우트에 <a> 사용 금지
```

외부 OAuth 리다이렉트처럼 진짜 페이지 이탈이 필요한 경우만 `window.location.href` 허용.

---

## 파일 위치 규칙

| 종류 | 위치 | 예시 |
|---|---|---|
| 페이지 컴포넌트 | `src/pages/` | `StorePage.jsx` |
| 인증 관련 컴포넌트·훅 | `src/features/auth/` | `LoginPage.jsx`, `useAuth.js` |
| 홈 섹션 컴포넌트 | `src/features/components/home/` | `BestSellers.jsx` |
| 공유 레이아웃 컴포넌트 | `src/features/components/layout/` | `Header.jsx` |
| 공유 UI 컴포넌트 | `src/features/components/ui/` | `Toast.jsx` |
| 공유 유틸·헬퍼 | `src/shared/` | `Spinner.jsx`, `formatters.js` |
| API 파일 | `src/api/` | `productApi.js`, `searchApi.js` |
| Redux 슬라이스 | `src/features/{domain}/` | `productSlice.js` |
| 커스텀 훅 | `src/hooks/` | `useAppSelector.js` |
| Redux store | `src/store/store.js` | (경로 주의: `src/app/` 아님) |
| 라우터 | `src/router.jsx` | (경로 주의: `App.jsx` 아님) |

---

## 파일 네이밍 컨벤션

| 종류 | 네이밍 | 예시 |
|---|---|---|
| 컴포넌트 | `PascalCase.jsx` | `ProductDetailPage.jsx` |
| 훅 | `useCamelCase.js` | `useStorePageController.js` |
| API 슬라이스 | `{domain}Api.js` | `searchApi.js` |
| Redux 슬라이스 | `{domain}Slice.js` | `productSlice.js` |
| 유틸·상수 | `camelCase.js` | `formatters.js`, `oauth2.js` |

---

## 작업 시작 체크리스트

작업 시작 전 반드시 수행:
- [ ] `.claude/rules/` 확인 (doc-sync 우선)
- [ ] 관련 `docs/domain/*.md` 비즈니스 명세 읽기 (**Docs First**)
- [ ] 수정할 파일 `Read` 도구로 먼저 읽기
- [ ] 기존 패턴과 일관성 유지 계획 수립
- [ ] 새 API 파일 추가 시 `store.js` import 확인
