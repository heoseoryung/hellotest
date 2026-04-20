# daisyUI v5 컴포넌트 사용 예제

## 카드 (ProductCard 패턴)

```jsx
<div className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow duration-200 group">
  <figure className="overflow-hidden aspect-[4/3]">
    <img
      src={imageUrl}
      alt={name}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
    />
  </figure>
  <div className="card-body p-4 gap-1">
    <div className="flex items-center gap-2">
      <span className="badge badge-outline badge-sm">카테고리</span>
      <span className="badge badge-error badge-sm">품절</span>
    </div>
    <h3 className="font-medium text-sm line-clamp-2">{name}</h3>
    <p className="font-bold text-primary">{formatPrice(salePrice)}</p>
  </div>
</div>
```

---

## 폼 (label + input 조합)

```jsx
<form onSubmit={handleSubmit} className="space-y-3">
  {/* form-control 패턴 */}
  <label className="form-control">
    <div className="label">
      <span className="label-text">이메일</span>
      <span className="label-text-alt text-error">필수</span>
    </div>
    <input
      type="email"
      className="input input-bordered"
      placeholder="user@example.com"
      value={form.email}
      onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
      required
    />
  </label>

  {/* textarea */}
  <textarea
    className="textarea textarea-bordered w-full"
    placeholder="내용 입력..."
    rows={4}
    maxLength={1000}
    value={form.content}
    onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))}
  />

  {/* select */}
  <select
    className="select select-bordered w-full"
    value={form.type}
    onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
  >
    <option value="etc">기타</option>
    <option value="product">상품 문의</option>
  </select>

  {/* checkbox */}
  <label className="flex items-center gap-2 cursor-pointer">
    <input
      type="checkbox"
      className="checkbox checkbox-sm checkbox-primary"
      checked={form.isSecret}
      onChange={(e) => setForm(f => ({ ...f, isSecret: e.target.checked }))}
    />
    <span className="text-sm">비밀 문의</span>
  </label>

  {/* 에러 메시지 */}
  {error && (
    <div className="alert alert-error py-2 text-sm">
      <span>{error.data?.message}</span>
    </div>
  )}

  <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
    {isLoading
      ? <span className="loading loading-spinner loading-sm"></span>
      : '제출'}
  </button>
</form>
```

---

## 뱃지 (주문 상태)

```jsx
// constants.js에 정의된 매핑 활용
<span className={`badge ${ORDER_STATUS_BADGE[order.status]}`}>
  {ORDER_STATUS_LABEL[order.status]}
</span>

// 수동 작성 시
<span className="badge badge-success badge-sm">배송 완료</span>
<span className="badge badge-warning badge-sm">결제 대기</span>
<span className="badge badge-error badge-sm">취소</span>
<span className="badge badge-outline badge-sm">기타</span>
```

---

## 드롭다운 (Header 유저 메뉴)

```jsx
<div className="dropdown dropdown-end">
  <label tabIndex={0} className="btn btn-ghost btn-circle avatar placeholder">
    <div className="bg-primary text-primary-content rounded-full w-9">
      <span className="text-sm font-bold">{user?.name?.[0]}</span>
    </div>
  </label>
  <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-44">
    <li className="menu-title px-2 py-1 text-xs text-base-content/50">홍길동님</li>
    <li><Link to="/my/orders">내 주문</Link></li>
    <li><button onClick={handleLogout} className="text-error">로그아웃</button></li>
  </ul>
</div>
```

---

## 탭

```jsx
<div role="tablist" className="tabs tabs-bordered mb-6">
  <button
    role="tab"
    className={`tab ${activeTab === 'reviews' ? 'tab-active' : ''}`}
    onClick={() => setActiveTab('reviews')}
  >
    리뷰 (10)
  </button>
  <button
    role="tab"
    className={`tab ${activeTab === 'inquiries' ? 'tab-active' : ''}`}
    onClick={() => setActiveTab('inquiries')}
  >
    문의 (3)
  </button>
</div>
```

---

## 아코디언 (Collapse)

```jsx
<div className="collapse collapse-arrow bg-base-200">
  <input type="checkbox" />
  <div className="collapse-title font-medium">
    질문 제목
  </div>
  <div className="collapse-content text-sm">
    <p>답변 내용...</p>
  </div>
</div>
```

---

## 수량 조절 (Join 버튼 그룹)

```jsx
<div className="join">
  <button
    className="join-item btn btn-sm"
    onClick={() => setQuantity(q => Math.max(1, q - 1))}
  >−</button>
  <span className="join-item btn btn-sm btn-ghost pointer-events-none w-12">
    {quantity}
  </span>
  <button
    className="join-item btn btn-sm"
    onClick={() => setQuantity(q => Math.min(stock, q + 1))}
  >+</button>
</div>
```

---

## 별점 (Rating)

```jsx
{/* 표시용 (읽기 전용) */}
<span className="text-yellow-500 text-sm">
  {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
</span>

{/* 입력용 */}
<div className="rating rating-sm">
  {[1, 2, 3, 4, 5].map((n) => (
    <input
      key={n}
      type="radio"
      name="rating"
      className="mask mask-star-2 bg-yellow-400"
      checked={editForm.rating === n}
      onChange={() => setEditForm(f => ({ ...f, rating: n }))}
    />
  ))}
</div>
```

---

## 페이지네이션

```jsx
<div className="flex justify-center">
  <div className="join">
    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
      <button
        key={p}
        className={`join-item btn btn-sm ${p === page ? 'btn-active' : ''}`}
        onClick={() => handlePageChange(p)}
      >
        {p}
      </button>
    ))}
  </div>
</div>
```

---

## 빈 상태 (Empty State)

```jsx
<div className="text-center py-20 text-base-content/50">
  <p className="text-5xl mb-4">📦</p>
  <p className="mb-4">아직 주문 내역이 없습니다</p>
  <Link to="/products" className="btn btn-primary btn-sm">쇼핑하러 가기</Link>
</div>
```
