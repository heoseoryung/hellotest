# Cart 도메인

기준일: 2026-04-17

## 개요

장바구니 아이템 CRUD는 `cartApi`(RTK Query), 체크박스 선택 UI 상태는 `cartSlice`가 분리해서 관리한다.  
**선택 상태(`isSelected`)는 서버에 저장하지만 GET 응답에 포함되지 않으므로 Redux로 관리.**  
**CartPage 렌더링에 사용하는 API: `GET /cart/` + `GET /product/frontend/{productId}`(상품 요약).**  
**금액은 `useGetProductSummaryQuery`의 `price` × `quantity`로 클라이언트가 계산.**

---

## 비즈니스 정책

| 정책 | 근거 |
|---|---|
| 아이템 표시 데이터 | `useGetProductSummaryQuery(productId)` → 이름·이미지·가격·옵션명 |
| 금액(합계·배송비) | **클라이언트 계산** — `price × quantity` 합산, 배송비 기준 50,000원 |
| 배송비 기준 | 50,000원 이상 무료 — `SHIPPING_FREE_THRESHOLD` |
| 기본 배송비 | 5,000원 — `SHIPPING_FEE` |
| 수량 = 0 요청 | 해당 아이템 삭제로 처리 (`PUT /cart/item/quantity { quantity: 0 }`) |
| 동일 상품/옵션 추가 | 서버에서 수량 합산 처리 |
| 아이템 식별 | `productId + optionId` 조합 (cartItemId 없음) |

---

## 상태 구조

```js
// cartSlice — 체크 UI 상태 (Redux 관리)
cart
└── checkedItemIds: string[]   // 체크된 아이템 키 목록 — `${productId}-${optionId ?? 'none'}`

// RTK Query 캐시 — 장바구니 아이템 목록
api.queries.getCart → {
  userId: number,
  items: CartItem[]
}
```

---

## CartItem 데이터 구조 (서버 응답 그대로)

```js
{
  productId: number,
  optionId:  number | null,
  quantity:  number,
}
```

> 표시용 이름·이미지·가격·옵션명은 `useGetProductSummaryQuery(productId)`(`GET /product/frontend/{productId}`)로 별도 조회.  
> `price` 필드 포함 — CartItemRow에서 `price × quantity`로 금액 계산.

---

## 아이템 키 생성 규칙

```js
const itemKey = (item) => `${item.productId}-${item.optionId ?? 'none'}`
```

이 키를 `checkedItemIds` 배열의 원소로 사용.

---

## API 엔드포인트 (`src/api/cartApi.js`)

`apiSlice.injectEndpoints()`로 정의. 모든 Mutation은 `invalidatesTags: [{ type: 'Cart', id: 'LIST' }]`.

### Queries

| 훅 | 메서드 | 경로 | 설명 |
|---|---|---|---|
| `useGetCartQuery()` | GET | `/cart/all` | 전체 조회 — `{userId, items: [{productId, optionId, quantity}]}` |

### Mutations

| 훅 | 메서드 | 경로 | 요청 바디 | 설명 |
|---|---|---|---|---|
| `useAddCartItemMutation` | POST | `/cart/additem` | `{productId, optionId, quantity}` | 상품 추가 (동일 productId+optionId면 수량 합산) |
| `useUpdateCartItemQuantityMutation` | PUT | `/cart/item/quantity` | `{productId, optionId, quantity}` | 수량 변경 (0이면 삭제) |
| `useUpdateCartItemOptionMutation` | PUT | `/cart/item/option` | `{productId, optionId, newOptionId}` | 옵션 변경 (기존 항목과 합산 후 삭제) |
| `useRemoveCartItemMutation` | DELETE | `/cart/item` | `{productId, optionId}` | 단건 삭제 |
| `useSelectCartItemMutation` | PUT | `/cart/item/select` | `{productId, optionId, isSelected}` | 선택 상태 서버 저장 (응답에 선택 상태 미포함) |

> 전체선택(select-all) 엔드포인트 없음 → 개별 `selectCartItem` 반복 호출로 구현.  
> 복수 삭제 엔드포인트 없음 → `removeCartItem` 반복 호출로 구현.

---

## 클라이언트 금액 계산

```js
// 아이템 단가 (상품 기본가 + 옵션 추가가)
const unitPrice = product.price + (option?.extra ?? 0)
const itemTotal = unitPrice * item.quantity

// 선택 아이템 합산
const totalProductPrice = selectedItems.reduce((sum, {item, product, option}) => 
  sum + (product.price + (option?.extra ?? 0)) * item.quantity, 0)

// 배송비
const shippingFee = totalProductPrice >= SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_FEE
const finalPayment = totalProductPrice + shippingFee
```

---

## cartSlice 액션 & 셀렉터

```js
// Actions (cartSlice)
initCheckedItems(keys[])   // getCart 성공 시 호출 (현재 서버 선택 상태 미반환이므로 미사용)
toggleCheckItem(key)       // 개별 체크 토글 — CartPage에서 사용
checkAllItems(keys[])      // 전체 체크 — 전체선택 버튼
uncheckAllItems()          // 전체 해제

// Selectors
selectCheckedItemIds(state)  // string[] — itemKey 배열
```

---

## 선택 상태 변경 패턴

체크박스 UI는 Redux, 서버 저장은 selectCartItem mutation 동시 호출:

```js
const dispatch = useAppDispatch()
const [selectItem] = useSelectCartItemMutation()

const handleToggle = (item) => {
  const key = itemKey(item)
  const next = !checkedIds.includes(key)
  dispatch(toggleCheckItem(key))
  selectItem({ productId: item.productId, optionId: item.optionId, isSelected: next })
}
```
