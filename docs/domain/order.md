# Order 도메인

기준일: 2026-04-17

## 개요

주문 생성·조회·취소·환불을 담당한다. 주문 완료 직후 주문확인 페이지 표시용 임시 데이터만 `orderSlice`가 보관하고, 나머지 서버 데이터는 RTK Query `api` 캐시에만 존재한다.

---

## 비즈니스 정책

| 정책 | 값 | 코드 위치 |
|---|---|---|
| 무료배송 기준 | 50,000원 이상 | `src/shared/utils/constants.js` → `SHIPPING_FREE_THRESHOLD` |
| 기본 배송비 | 5,000원 | `src/shared/utils/constants.js` → `SHIPPING_FEE` |
| 취소·교환·반품 신청 기한 | 배송완료일 기준 3일 이내 | `src/shared/utils/constants.js` → `RETURN_DEADLINE_DAYS` |
| 기본 페이지 크기 | 10건 | `src/shared/utils/constants.js` → `ORDER_PAGE_SIZE` |

---

## 주문 상태값

```js
ORDER_STATUS = {
  PENDING:    '입금전',
  PREPARING:  '배송준비중',
  SHIPPING:   '배송중',
  DELIVERED:  '배송완료',
  CANCELLED:  '취소',
  EXCHANGED:  '교환',
  REFUNDED:   '반품',
}
```

코드 위치: `src/shared/utils/constants.js` → `ORDER_STATUS`

---

## 금액 계산

```
최종 결제금액 = 상품금액 + 배송비 - 쿠폰할인 - 할인코드할인 - 적립금사용액

배송비: calcShippingFee(상품금액)  // formatters.js (SHIPPING_FREE_THRESHOLD 기준)
```

---

## 상태 구조

```js
// orderSlice — UI 상태만
order
├── lastCreatedOrder: Order | null   // 주문 완료 직후 임시 보관 (주문완료 페이지용)
└── pagination: { page: 1, size: ORDER_PAGE_SIZE }

// store.js serializableCheck 예외 등록됨
ignoredPaths: ['order.lastCreatedOrder.createdAt']
```

---

## Order 데이터 구조 (normalizeOrder 적용 후)

```js
{
  id: number,
  date: string,           // createdAt 날짜 부분 (YYYY-MM-DD)
  status: string,         // orderStatus
  items: [{
    productId, name, option, qty, price, img
  }],
  productPrice: number,   // productAmount
  shippingPrice: number,  // shippingFee
  discountPrice: number,  // discountAmount
  total: number,          // totalAmount
}
```

---

## API 엔드포인트 (`src/api/orderApi.js`)

`apiSlice.injectEndpoints()`로 정의.

| 훅 | 메서드 | 경로 | 설명 |
|---|---|---|---|
| `useGetOrdersQuery(params)` | GET | `/orders` | 목록 — `{ pagination, status, period }` 파라미터. 응답: `{ content, totalPages, totalElements }` |
| `useGetOrderByIdQuery(orderId)` | GET | `/orders/:orderId` | 상세 |
| `useCreateOrderMutation` | POST | `/orders` | 주문 생성 → `setLastCreatedOrder` dispatch |
| `useCancelOrderMutation` | PUT | `/orders/:orderId/cancel` | 취소 — `{ orderId, reason }` |
| `useRefundOrderMutation` | PUT | `/orders/:orderId/refund` | 환불 요청 — `{ orderId, body }` |

---

## 주문 생성 흐름

```
CheckoutPage
  1. 배송지 입력 (받는사람 / 주소검색 / 휴대폰 / 배송메시지)
  2. 할인/부가결제 (할인코드 / 쿠폰 / 적립금)
  3. 결제수단 선택
  4. 이용약관 동의 (필수) → 동의 전까지 "결제하기" 버튼 비활성
  5. useCreateOrderMutation 호출
  6. 성공 → setLastCreatedOrder dispatch → 주문완료 페이지
```

---

## 목록 필터링

| 파라미터 | 선택지 |
|---|---|
| `status` | 전체·입금전·배송준비중·배송중·배송완료·취소·교환·반품 |
| `period` | 오늘·1개월·3개월·6개월·기간설정 |

필터 값은 서버 파라미터로 전달 (클라이언트 필터링 금지).

---

## 액션 & 셀렉터

```js
// Actions
setLastCreatedOrder(order)    // createOrder 성공 후 자동 호출
clearLastCreatedOrder()       // 주문완료 페이지 언마운트 시 호출
setOrderPage(page)

// Selectors
selectLastCreatedOrder(state)
selectOrderPagination(state)
```
