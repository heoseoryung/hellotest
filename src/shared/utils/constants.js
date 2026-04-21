// ─── 배송 정책 ────────────────────────────────────────────────────────────────
export const SHIPPING_FEE = 5000
export const SHIPPING_FREE_THRESHOLD = 50000

// ─── 일반 상품 수량 할인 티어 ─────────────────────────────────────────────────
// 상품 상세 수량 박스에서 사용
// 총 금액 = (price + optionExtra) × qty × (1 - discountRate / 100)
export const QUANTITY_DISCOUNTS = [
  { qty: 1,  label: '단품',     discountRate: 0  },
  { qty: 5,  label: '5개 이상', discountRate: 5  },
  { qty: 10, label: '10개 이상', discountRate: 10 },
]

// ─── 정기배송 주기별 할인 ─────────────────────────────────────────────────────
// 상품 상세 배송주기 드롭다운 옆에서 사용 (백엔드 deliveryCycles 데이터와 value 매핑)
// value는 백엔드 deliveryCycles[].value 와 일치해야 함
export const CYCLE_DISCOUNTS = [
  { value: '1w', label: '1주', discount: 2000  },
  { value: '1m', label: '1달', discount: 8000  },
  { value: '2m', label: '2달', discount: 16000 },
  { value: '3m', label: '3달', discount: 32000 },
]
