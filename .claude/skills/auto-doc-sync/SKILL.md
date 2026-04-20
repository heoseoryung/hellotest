---
name: auto-doc-sync
description: "멍샵 프로젝트의 문서 자동 동기화 규칙. 코드 변경 시 docs/*.md 를 함께 업데이트하는 Docs First 원칙, 변경 보고 형식, 신규 도메인 문서 생성 기준을 정의한다. TRIGGER when: 배송비·포인트율·주문 상태값·카테고리 등 정책 상수를 추가하거나 수정할 때, 신규 도메인이나 페이지 뷰를 추가할 때, 기존 비즈니스 로직의 동작 방식이 바뀔 때, API 엔드포인트나 데이터 구조가 변경될 때. Do NOT use for: 스타일·레이아웃 등 UI만 변경하는 작업, 문서와 무관한 리팩토링."
user-invocable: false
---

# 문서 자동 동기화 (Auto Doc Sync)

코드 변경 시 문서 갱신이 누락되는 일이 없도록 강제하는 가이드.

---

## 핵심 규칙 요약

| 규칙 | 내용 | 위반 시 |
|---|---|---|
| **Auto-Doc Sync** | 비즈니스 로직 변경 시 관련 docs/*.md 자동 갱신 | 문서 ↔ 코드 괴리 발생 |
| **Docs First** | 작업 전 docs/*.md 먼저 읽기 | 명세와 다른 구현 위험 |
| **Change Report** | 작업 완료 보고 시 코드+문서 변경 모두 기술 | 변경 이력 불투명 |

---

## Auto-Doc Sync: 어떤 변경이 docs 갱신을 트리거하는가

### 갱신이 필요한 코드 변경

| 변경 내용 | 갱신 대상 |
|---|---|
| 주문 상태값 추가/변경 | `docs/domain/order.md` |
| 배송비 정책 변경 | `docs/domain/order.md` |
| 포인트 적립율 변경 | `docs/domain/user.md` |
| 리뷰 정책 변경 | `docs/domain/review.md` |
| API 엔드포인트 추가·수정 | 해당 도메인 docs |
| transformResponse 응답 구조 변경 | 해당 도메인 docs |
| 신규 도메인 추가 | `docs/domain/{domain}.md` 신규 생성 |
| 신규 뷰(레이아웃·복합 페이지) 추가 | `docs/view/{view}.md` 신규 생성 |
| GNB 구성 방식 변경 | `docs/domain/product.md` |
| 인증 흐름 변경 | `docs/domain/auth.md` |

### 갱신 불필요한 변경

- UI 레이아웃·스타일 변경
- 리팩토링 (동작 변경 없음)
- 에러 메시지 문구 수정
- 성능 최적화

---

## Docs First: 작업 시작 전 필독 순서

```
1. CLAUDE.md 전체 확인 (특히 Rules)
   ↓
2. 관련 docs/*.md 읽기
   - 상품 관련    → docs/domain/product.md
   - 주문 관련    → docs/domain/order.md
   - 리뷰 관련    → docs/domain/review.md
   - 인증 관련    → docs/domain/auth.md
   - 카트 관련    → docs/domain/cart.md
   - 위시리스트   → docs/domain/wishlist.md
   - 유저 관련    → docs/domain/user.md
   - 뷰 레이아웃  → docs/view/{view}.md
   ↓
3. 수정할 코드 파일 Read 도구로 읽기
   ↓
4. 문서와 코드 사이 괴리 발견 시 → 먼저 사용자에게 확인
```

---

## Change Report: 변경 보고 형식

작업 완료 후 반드시 아래 형식으로 보고:

```
### 수정된 코드
- `src/api/productApi.js` — getMainBestSellers transformResponse 구조 변경

### 수정된 문서
- `docs/domain/product.md` § 랜딩페이지 전용 Queries — 응답 구조 갱신
```

---

## 현재 docs 파일 목록

```
docs/
├── project-structure.md     전체 src/ 구조 개요
├── api-hooks.md             API 훅 전체 목록
└── domain/
    ├── auth.md              인증·소셜로그인
    ├── product.md           상품·카테고리·랜딩페이지 섹션
    ├── review.md            리뷰 CRUD
    ├── cart.md              장바구니
    ├── order.md             주문
    ├── wishlist.md          위시리스트
    ├── user.md              회원·포인트·쿠폰
    └── ui.md                공통 UI 컴포넌트
```

> `docs/view/` 폴더는 아직 없음 — 복합 뷰 추가 시 생성.

---

## 새 docs/*.md 작성 방법

필수 섹션:

1. **개요** — 도메인의 역할과 담당 범위
2. **비즈니스 정책** — 계산식, 제한 수치, 상태 전이 규칙 (코드 위치 명시)
3. **API 엔드포인트** — 훅명 / 메서드 / 경로 / 응답 구조
4. **데이터 구조** — transformResponse 후 컴포넌트 전달 형태
5. **캐시 무효화 전략** — providesTags / invalidatesTags

---

## 문서 작성 품질 기준

### 좋은 비즈니스 정책 기술 ✅
```markdown
## 배송비 정책
| 조건 | 배송비 |
|---|---|
| 주문 금액 **50,000원 이상** | **무료** |
| 주문 금액 50,000원 미만 | **3,000원** |
- 코드 위치: `src/shared/utils/formatters.js` → `calcShippingFee()`
```

### 나쁜 기술 ❌
```markdown
## 배송비
배송비는 주문 금액에 따라 달라집니다.
```
코드 위치 없고, 수치 없음 → 나중에 코드와 괴리 발생.

---

## API 응답 구조 명세 예시

```markdown
#### `useGetHomeBestsellerQuery` 응답 구조 (`searchApi.js`)
```js
[
  {
    id, rank, name, img, price,
    score, salesCount, productUrl
  }
]
// GET /search/products/home-bestseller
```
```
