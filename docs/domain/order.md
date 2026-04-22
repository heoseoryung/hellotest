# Order 도메인

기준일: 2026-04-22

## 개요

주문 생성·조회·취소를 담당한다. 주문 완료 직후 주문확인 페이지 표시용 임시 데이터만 `orderSlice`가 보관하고, 나머지 서버 데이터는 RTK Query `api` 캐시에만 존재한다.

---

## 전체 Saga 흐름

```
주문 생성 → 재고 예약 → 결제 요청 → 결제 완료 → 재고 차감 → 주문 완료
```

Order 서버의 역할:

| 단계 | Order 서버 동작 |
|---|---|
| `POST /orders` 수신 | 주문 생성, `ORDER_CHECKED_OUT` 상태 |
| `PaymentCompleted` 이벤트 수신 | `order_state = ORDER_COMPLETED` 반영 |
| `PaymentFailed` 이벤트 수신 | `order_state = PAYMENT_FAILED`, `failed_reason`, `failed_at` 기록 |

> Order 서버는 결제 성공/실패를 **직접 판단하지 않는다** — Payment 서버가 발행하는 이벤트를 수신해 상태를 반영할 뿐이다.

---

## 비즈니스 정책

| 정책 | 값 | 코드 위치 |
|---|---|---|
| 무료배송 기준 | 50,000원 이상 | `src/shared/utils/constants.js` → `SHIPPING_FREE_THRESHOLD` |
| 기본 배송비 | 5,000원 | `src/shared/utils/constants.js` → `SHIPPING_FEE` |
| 취소·교환·반품 신청 기한 | 배송완료일 기준 3일 이내 | `src/shared/utils/constants.js` → `RETURN_DEADLINE_DAYS` |
| 기본 페이지 크기 | 20건 (서버 기본값) | 서버 pageable.pageSize |

---

## 주문 상태값 (OrderState)

서버 응답의 `order_state` 필드 기준:

```js
ORDER_STATE = {
  ORDER_CHECKED_OUT: '주문접수',   // POST /orders 생성 직후
  ORDER_COMPLETED:   '주문완료',   // PaymentCompleted 이벤트 수신 후
  PAYMENT_FAILED:    '결제실패',   // PaymentFailed 이벤트 수신 후
  ORDER_CANCELLED:   '주문취소',
}
```

결제 실패 시 Order 서버가 기록하는 필드:

```
order_state   = PAYMENT_FAILED
failed_reason = Payment 서버에서 전달된 실패 사유 (예: "카드 한도 초과")
failed_at     = 실패 시각 (ISO 8601)
```

> 주문 취소 saga는 현재 서버에서 비활성화 상태 — `DELETE /orders/{order_id}` 호출 시 `409 Conflict` 반환.

---

## 금액 계산

```
최종 결제금액 = 상품금액 + 배송비 - 쿠폰할인 - 할인코드할인 - 적립금사용액

배송비: totalProductPrice >= 50,000 → 0원 / 미만 → 5,000원
```

---

## 상태 구조

```js
// orderSlice — UI 상태만
order
├── lastCreatedOrder: Order | null   // 주문 완료 직후 임시 보관 (주문완료 페이지용)
└── pagination: { page: 0, size: 20 }
```

---

## Order 데이터 구조 (서버 응답 → normalizeOrder 적용 후)

### 목록/상세 공통 (`GET /orders`, `GET /orders/{order_id}`)

```js
// 서버 응답 원본
{
  order_id:       number,
  user_id:        number,
  amount:         number,
  receiver_name:  string,
  receiver_phone: string,
  receiver_addr:  string,
  delete_yn:      'Y' | 'N',
  time:           string,          // ISO 8601 (예: "2026-04-20T14:30:00")
  order_state:    string,          // ORDER_CHECKED_OUT | ORDER_COMPLETED | PAYMENT_FAILED | ...
  failed_reason:  string | null,
  failed_at:      string | null,
  items?: [...]                    // 상세 조회 시만 포함
}

// normalizeOrder 적용 후 (프론트 사용 형태)
{
  id:            number,           // order_id
  date:          string,           // time (ISO 문자열 그대로)
  status:        string,           // order_state
  ordererName:   string,           // receiver_name
  total:         number,           // amount
  address: {
    recipient: string,             // receiver_name
    address:   string,             // receiver_addr
    phone:     string,             // receiver_phone
  },
  items: [{                        // 상세 조회 시
    productId: number,             // product_id
    name:      string,             // product_name
    option:    string,             // option_name
    qty:       number,             // quantity
    price:     number,             // price (단가)
    total:     number,             // total_price
  }]
}
```

### 주문 상품 이력 (`GET /orders/me/history`)

```js
// 서버 응답 (배열)
[{
  id:           number,
  user_id:      number,
  order_id:     number,
  product_id:   number,
  option_id:    number,
  product_name: string,
  option_name:  string,
  price:        number,
  quantity:     number,
  total_price:  number,
  order_state:  string,
  failed_reason: string | null,
  failed_at:    string | null,
}]
```

---

## API 엔드포인트 (`src/api/orderApi.js`)

Base URL: `http://localhost:8072/api/v1`  
`apiSlice.injectEndpoints()`로 정의.

### Queries

| 훅 | 메서드 | 경로 | 설명 |
|---|---|---|---|
| `useGetOrdersQuery(params)` | GET | `/orders` | 목록 — `{ start_date, end_date, status, page }` 파라미터. `X-User-Id` 헤더 필요 |
| `useGetOrderByIdQuery(orderId)` | GET | `/orders/{order_id}` | 상세 (items 포함) |
| `useGetMyOrderHistoryQuery()` | GET | `/orders/me/history` | 주문 상품 이력 (item 단위). `X-User-Id` 헤더 필요. 내역 없으면 `204` |

### Mutations

| 훅 | 메서드 | 경로 | 요청 바디 | 설명 |
|---|---|---|---|---|
| `useCreateOrderMutation` | POST | `/orders` | 아래 참조 | 주문 생성 → `setLastCreatedOrder` dispatch |
| `useCancelOrderMutation` | DELETE | `/orders/{order_id}` | — | 취소 요청 (현재 서버 saga 비활성화 → `409` 반환) |
| `useConfirmPaymentMutation` | POST | `/payments/confirm` | `{ paymentKey, orderId, amount }` | TossPayments 결제 승인 |

### `useCreateOrderMutation` 요청 바디

```js
{
  user_id:        number,
  receiver_name:  string,
  receiver_phone: string,   // "010-1234-5678" 형식
  receiver_addr:  string,
  items: [
    { productId: number, optionId: number, quantity: number }
  ]
}
```

> 성공 시 `201 Created`, 응답 body는 텍스트 메시지 (JSON 아님).  
> `normalizeOrder` 적용 불가 — 응답 텍스트를 그대로 `setLastCreatedOrder`에 저장하거나, 생성 후 `GET /orders`로 재조회 필요.

---

## 목록 필터링

| 파라미터 | 타입 | 선택지 |
|---|---|---|
| `start_date` | `yyyy-MM-dd` | 조회 시작일 |
| `end_date` | `yyyy-MM-dd` | 조회 종료일 |
| `status` | `OrderState` | `ORDER_CHECKED_OUT` \| `ORDER_COMPLETED` \| `PAYMENT_FAILED` \| ... |
| `page` | int | 0-based, 기본값 `0` |

필터 값은 서버 파라미터로 전달 (클라이언트 필터링 금지).

---

## TossPayments 결제위젯 연동 흐름

```
CartPage
  1. 선택 상품 기준 finalPayment / totalProductPrice / shippingFee 계산
  2. navigate('/checkout', { state: { finalPayment, totalProductPrice, shippingFee } })

CheckoutPage
  3. loadTossPayments(VITE_TOSS_CLIENT_KEY)
  4. tossPayments.widgets({ customerKey: `user_${user.id}` })
  5. widgets.setAmount({ currency: 'KRW', value: finalPayment })
  6. widgets.renderPaymentMethods / renderAgreement
  7. 결제하기 → widgets.requestPayment({ orderId, orderName, successUrl, failUrl, ... })

TossPayments Redirect
  8. 성공 → /payment/success?paymentKey=...&orderId=...&amount=...
  9. 실패 → /payment/fail?code=...&message=...&orderId=...

PaymentSuccessPage
  10. POST /payments/confirm { paymentKey, orderId, amount } → 백엔드 결제 승인
  11. 성공 → /order/list 이동
```

### 환경변수

| 키 | 설명 |
|---|---|
| `VITE_TOSS_CLIENT_KEY` | 결제위젯 클라이언트 키 (공개 가능, 프론트 전용) |

> 시크릿 키(`test_gsk_...`)는 백엔드 전용 — 절대 프론트 코드에 포함 금지.

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

---

## 알려진 이슈

| 항목 | 내용 |
|---|---|
| 주문 취소 | saga 비활성화 → `DELETE /orders/{order_id}` 는 항상 `409 Conflict` 반환 |
| CS 이력 | `GET /orders/{order_id}/cs-history` 현재 항상 `204 No Content` 반환 |
| `POST /orders` 응답 | JSON이 아닌 텍스트 메시지 반환 — normalizeOrder 적용 불가 |
| `GET /orders/me/history` | 내역 없을 시 `204 No Content` (빈 배열 아님) — 훅에서 빈 배열로 변환 필요 |
