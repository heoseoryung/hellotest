# Payment 도메인

기준일: 2026-04-22

## 개요

`paymentserver`는 프론트와 TossPayments를 연결하는 결제 브리지 역할을 담당한다.  
외부 공개 경로는 `gatewayserver` 기준 `/api/v1/payments/**`, 내부 경로는 `/payments/**`.  
결제 성공/실패 결과는 최종적으로 `orderserver`가 주문 상태에 반영한다.

---

## 전체 Saga 흐름

```
주문 생성 → 재고 예약 → 결제 요청 → 결제 완료 → 재고 차감 → 주문 완료
```

> **미확정**: 결제 요청 단계가 `결제요청 → 주문접수 → 결제완료` 순인지,  
> payment 서버가 내부적으로 `결제요청 → 결제완료`를 단독 처리하는지 아직 확정되지 않음.

---

## 결제 흐름 (프론트 ↔ Payment 서버)

```
① paymentserver가 이벤트 수신 → 결제 준비(READY) 상태 생성
② 프론트 → POST /orders               → order_id 수령
③ 프론트 → POST /payments/prepare     → paymentId, amount(서버 검증값) 수령
④ 프론트 → widgets.setAmount(amount)  → TossPayments 위젯 금액 설정
⑤ 프론트 → widgets.requestPayment()   → TossPayments 결제창 호출
⑥ TossPayments Redirect               → /payment/success?paymentKey=...&orderId=...&amount=...
⑦ 프론트 → POST /payments/confirm     → paymentserver가 Toss 승인 API 호출
⑧ 성공: PaymentCompleted 이벤트 발행 → orderserver ORDER_COMPLETED 반영
   실패: PaymentFailed 이벤트 발행   → orderserver PAYMENT_FAILED + failedReason 기록
```

> `userId`는 body에 포함하지 않는다 — gatewayserver가 인증 성공 후 `X-User-Id` 헤더를 내부적으로 주입.

---

## Payment 서버 역할 및 금액 기준

Payment 서버가 **금액의 최종 기준**을 보유한다.

| 담당 | 내용 |
|---|---|
| Toss 실제 통신 | TossPayments 승인/취소 API 직접 호출 |
| 결제 승인/취소 | confirm, cancel 처리 |
| 성공/실패 판단 | APPROVED / FAILED 상태 결정 |
| 실패 사유 확보 | failureCode, failureMessage 보관 |
| 이벤트 발행 | PaymentCompleted / PaymentFailed outbox 이벤트 적재 |

Order 서버는 결제 실패 시 Payment 서버 이벤트를 받아 아래만 기록:
```
orderState   = PAYMENT_FAILED
failedReason = "카드 한도 초과"   ← Payment 서버가 전달
failedAt     = 실패 시각
```

---

## 결제 상태값 (Payment Status)

| 값 | 설명 |
|---|---|
| `READY` | 결제 준비 완료 (`prepare` 성공) |
| `APPROVED` | 결제 승인 완료 (`confirm` 성공) |
| `FAILED` | 결제 실패 |
| `CANCELED` | 결제 취소 |

---

## API 엔드포인트

Base URL (프론트 기준): `http://localhost:8072/api/v1/payments`

### `POST /payments/prepare`

결제 준비 레코드 생성. 결제위젯 렌더링 전 호출.

**Request Body**

```json
{
  "orderId": 200001,
  "orderName": "어글어글 스팀 100g 8종",
  "amount": 12900,
  "customerName": "홍길동",
  "customerEmail": "test@example.com",
  "currency": "KRW"
}
```

| 필드 | 타입 | 필수 | 설명 |
|---|---|:---:|---|
| `orderId` | Long | ✅ | Order 서버가 발급한 주문 ID |
| `orderName` | String | ✅ | 주문명 또는 대표 상품명 |
| `amount` | Long | ✅ | 결제 금액 (1 이상) |
| `customerName` | String | ❌ | 주문자명 |
| `customerEmail` | String | ❌ | 주문자 이메일 |
| `currency` | String | ❌ | 통화 코드, 기본값 `KRW` |

**Success Response** `201 Created`

```json
{
  "paymentId": "pay_7b3e04d227af44d2b2a2b9f7b7f1c555",
  "orderId": 200001,
  "orderName": "어글어글 스팀 100g 8종",
  "amount": 12900,
  "customerName": "홍길동",
  "customerEmail": "test@example.com",
  "currency": "KRW",
  "status": "READY"
}
```

> `paymentId`는 이후 취소 API(`POST /payments/{paymentId}/cancel`) 경로에 사용.  
> `amount`는 서버 검증값 — 이 값을 `widgets.setAmount()`에 사용해야 함.

---

### `POST /payments/confirm`

TossPayments 결제 후 받은 `paymentKey`, `orderId`, `amount`로 Toss 승인 API 호출.

**Request Body**

```json
{
  "paymentKey": "tgen_20260417123456abc123",
  "orderId": 200001,
  "amount": 12900
}
```

| 필드 | 타입 | 필수 | 설명 |
|---|---|:---:|---|
| `paymentKey` | String | ✅ | TossPayments 위젯이 반환한 결제 키 |
| `orderId` | Long | ✅ | 주문 ID |
| `amount` | Long | ✅ | 결제 금액 |

**Success Response** `200 OK`

```json
{
  "paymentId": "pay_7b3e04d227af44d2b2a2b9f7b7f1c555",
  "orderId": 200001,
  "userId": 7,
  "provider": "TOSS",
  "method": "CARD",
  "easyPayProvider": null,
  "amount": 12900,
  "currency": "KRW",
  "paymentKey": "tgen_20260417123456abc123",
  "status": "APPROVED",
  "failureCode": null,
  "failureMessage": null,
  "approvedAt": "2026-04-17T15:30:00",
  "canceledAt": null
}
```

**Error Response** `409 Conflict` — Toss 승인 실패 또는 결제 상태 충돌

```json
{
  "timestamp": "2026-04-17T15:32:00",
  "status": 409,
  "error": "Conflict",
  "message": "Toss 승인 API 호출에 실패했습니다."
}
```

> 승인 성공 시 내부적으로 `PaymentCompleted` outbox 이벤트 적재.  
> 승인 실패 시 내부적으로 `PaymentFailed` outbox 이벤트 적재.  
> 승인 성공/실패 시 주문 단위 SSE 채널에도 결과 이벤트 발행.

---

### `POST /payments/{paymentId}/cancel`

승인된 결제를 취소.

**Request Body**

```json
{
  "reason": "고객 단순 변심",
  "reasonType": "CUSTOMER_CHANGE_MIND",
  "cancelAmount": 12900
}
```

| 필드 | 타입 | 필수 | 설명 |
|---|---|:---:|---|
| `reason` | String | ✅ | 취소 사유 |
| `reasonType` | String | ✅ | 취소 사유 타입 enum (`CUSTOMER_CHANGE_MIND` 등) |
| `cancelAmount` | Long | ✅ | 취소 금액 |

**Success Response** `200 OK` — status: `CANCELED`

---

### `GET /payments/orders/{orderId}`

주문 ID 기준 현재 결제 상태 조회.

**Success Response** `200 OK`

```json
{
  "paymentId": "pay_7b3e04d227af44d2b2a2b9f7b7f1c555",
  "orderId": 200001,
  "status": "APPROVED",
  "amount": 12900,
  "method": "CARD",
  "approvedAt": "2026-04-17T15:30:00",
  "canceledAt": null
}
```

---

### `GET /payments/orders/{orderId}/events` (SSE)

주문 ID 기준 결제 상태를 SSE로 실시간 구독.

**Request Header:** `Accept: text/event-stream`

**Event 형식**

```text
event: payment-status
id: 200001
data: {"orderId":200001,"paymentId":"pay_...","status":"APPROVED","message":"결제가 완료되었습니다.","failureCode":null,"failureMessage":null,"approvedAt":"2026-04-17T15:30:00","failedAt":null}
```

| SSE status 값 | 설명 |
|---|---|
| `APPROVED` | 결제 완료 |
| `FAILED` | 결제 실패 |

> heartbeat는 `100ms` 간격으로 `:keepalive` 전송.  
> 재연결 시 마지막 상태 이벤트 1건 replay.

---

## RTK Query 엔드포인트 (`src/api/paymentApi.js`)

> Payment는 별도 `paymentApi.js` 파일로 분리 예정. 현재 `confirmPayment`는 `orderApi.js`에 임시 등록되어 있으나 `paymentApi.js`로 이전 필요.

| 훅 | 메서드 | 경로 | 설명 |
|---|---|---|---|
| `usePreparePaymentMutation` | POST | `/payments/prepare` | 결제 준비 — orderId·amount·orderName 전송 |
| `useConfirmPaymentMutation` | POST | `/payments/confirm` | 결제 승인 — paymentKey·orderId·amount 전송 |
| `useCancelPaymentMutation` | POST | `/payments/{paymentId}/cancel` | 결제 취소 |
| `useGetPaymentByOrderIdQuery` | GET | `/payments/orders/{orderId}` | 결제 상태 조회 |

---

## 주요 합의 사항

| 항목 | 결정 |
|---|---|
| `userId` 전달 방식 | 프론트 body 미포함 — gateway가 인증 토큰에서 `X-User-Id` 자동 주입 |
| `orderId` 발급 주체 | Order 서버 (`POST /orders` 응답) — 프론트 랜덤 생성 금지 |
| 결제 금액 기준 | `prepare` 응답의 `amount` — 프론트 계산값 직접 사용 금지 |
| 승인 담당 서버 | Payment 서버 (`POST /payments/confirm`) |
| 주문 상태 반영 | Payment 서버 이벤트(`PaymentCompleted/Failed`) → Order 서버 자동 반영 |
| 최종 결제내역 조회 | Order 서버 기준 (`GET /orders/{order_id}`) 권장 |
