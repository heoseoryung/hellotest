# Wishlist 도메인

기준일: 2026-04-17

## 개요

관심상품(찜) 목록 조회·추가·삭제를 담당한다. 서버 데이터는 RTK Query `api` 캐시에만 존재하며, 별도 Redux slice는 없다.

---

## WishlistItem 데이터 구조

```js
{
  id: number,             // productId
  name: string,
  price: number,
  img: string,
  currentOption: string,  // 현재 선택된 옵션 (빈 문자열이면 미선택)
  options: string[],      // 선택 가능한 옵션 목록
}
```

---

## API 엔드포인트 (`src/api/wishlistApi.js`)

`apiSlice.injectEndpoints()`로 정의.

| 훅 | 메서드 | 경로 | 설명 |
|---|---|---|---|
| `useGetWishlistQuery()` | GET | `/wishlist` | 관심상품 목록 조회 |
| `useAddWishlistItemMutation` | POST | `/wishlist` | 추가 — `body: { productId }` |
| `useRemoveWishlistItemMutation` | DELETE | `/wishlist/:productId` | 단일 삭제 |

모든 Mutation은 `invalidatesTags: [{ type: 'Wishlist', id: 'LIST' }]`로 목록을 자동 재조회한다.

---

## 알려진 제한 사항

- 옵션 선택 드롭다운은 현재 로컬 상태만 변경 (서버에 저장하는 API 미연결)
- 전체삭제는 `items.forEach(removeWishlistItem)` 방식 — 요청이 아이템 수만큼 발생
