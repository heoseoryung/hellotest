# 변경 보고 형식 예시 (Change Report)

작업 완료 후 반드시 이 형식으로 보고한다.  
코드 변경과 문서 변경을 모두 기술해야 **Change Report** 충족.

---

## 예시 1: 배송비 정책 변경

> **작업 내용:** 무료배송 기준을 5만원 → 7만원으로 변경

### 수정된 코드

- `src/utils/constants.js`
  - `SHIPPING_FREE_THRESHOLD`: `50000` → `70000`
- `src/utils/formatters.js`
  - `calcShippingFee()` — 기준값을 상수에서 읽도록 이미 참조 중 (변경 불필요)
- `src/api/mockBaseQuery.js`
  - `POST /orders` 핸들러의 shippingFee 계산 — `calcShippingFee(subtotal)` 호출로 자동 반영

### 수정된 문서

- `docs/domain/orders.md` § 배송비 정책
  - 표 "주문 금액 **50,000원 이상** → 무료" → "주문 금액 **70,000원 이상** → 무료" 갱신

---

## 예시 2: 새 도메인 추가 (장바구니)

> **작업 내용:** 장바구니 도메인 scaffolding

### 생성된 코드

- `src/mocks/cart.js` — 초기 장바구니 Mock 데이터 2건
- `src/api/cartApi.js` — getCart, addToCart, updateCartItem, removeFromCart, clearCart 엔드포인트

### 수정된 코드

- `src/api/mockBaseQuery.js`
  - import: `mockCartItems` 추가
  - 모듈 변수: `let cartItems = [...mockCartItems]` 추가
  - `handleRequest()`: `// ── Cart ──` 라우트 블록 5개 추가
- `src/api/apiSlice.js`
  - `tagTypes`: `'Cart'` 추가
- `src/app/store.js`
  - `import '../api/cartApi'` 추가

### 생성된 문서

- `docs/domain/cart.md` (신규)
  - § 1. 데이터 구조: CartItem 스키마 기술
  - § 2. 비즈니스 정책: 중복 추가 시 수량 합산, 가격 스냅샷, 재고 제한
  - § 3. API 엔드포인트: 5개 엔드포인트 기술
  - § 4. Mock 데이터: 가변, 2건 초기 데이터
  - § 5. RTK Query 태그 전략: Cart LIST/단건 태그 기술

---

## 예시 3: 비즈니스 로직 변경 (포인트 적립율)

> **작업 내용:** 포인트 적립율 1% → 2%로 상향

### 수정된 코드

- `src/utils/constants.js`
  - `POINT_EARN_RATE`: `0.01` → `0.02`
- `src/utils/formatters.js`
  - `calcPointsEarned()` — `POINT_EARN_RATE` 상수 참조 중, 자동 반영

### 수정된 문서

- `docs/domain/points.md` § 포인트 적립 정책 > 구매 적립
  - "결제 금액의 **1%**" → "결제 금액의 **2%**" 갱신
  - 계산식 예시 수치 갱신: `Math.floor(payment.amount * 0.02)`

---

## 보고 시 누락 금지 항목

| 항목 | 이유 |
|---|---|
| 수정된 모든 파일 경로 | 리뷰어가 변경 범위 파악 |
| 변경 전 → 후 (수치 변경 시) | 정책 변경 추적 |
| 문서 섹션 위치 (`§ 섹션명`) | 어느 부분이 바뀌었는지 명시 |
| 신규 문서인지 갱신인지 | (신규) / (갱신) 구분 |

---

## Auto-Doc Sync 위반 예시 (하면 안 되는 것)

```
// ❌ 나쁜 보고 — 코드만 보고, 문서 갱신 없음
"SHIPPING_FREE_THRESHOLD를 70000으로 변경했습니다."

// ❌ 나쁜 보고 — 문서 갱신 했지만 보고 안 함
코드 수정 완료.
(docs/domain/orders.md는 수정했지만 보고에 포함 안 함)

// ✅ 좋은 보고
코드: constants.js SHIPPING_FREE_THRESHOLD 50000 → 70000
문서: docs/domain/orders.md § 배송비 정책 표 갱신
```
