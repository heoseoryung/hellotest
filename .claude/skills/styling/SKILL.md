---
name: styling
description: "멍샵 Tailwind CSS v4 + 커스텀 디자인 시스템 UI 구현 표준. daisyUI는 거의 비활성화, 커스텀 클래스(btn-primary, hover-primary 등)와 브랜드 컬러 직접 사용. 시맨틱 색상 시스템, 반응형 모바일 퍼스트 레이아웃, 상태별(로딩·에러·빈 상태) UI 패턴을 정의한다. TRIGGER when: UI 컴포넌트나 페이지 레이아웃을 새로 작성할 때, className이나 스타일을 추가·수정할 때, 버튼·카드 컴포넌트 클래스를 선택할 때, 반응형 레이아웃을 구현할 때. Do NOT use for: 비즈니스 로직·API 호출·상태 관리 등 UI와 무관한 작업."
user-invocable: false
---

# 스타일링 (Tailwind v4 + 커스텀 디자인 시스템)

---

## 설정 (`src/index.css`)

```css
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
@import "tailwindcss";
@plugin "daisyui" {
  themes: false;
  base: false;
  styled: false;   /* daisyUI 컴포넌트 스타일 비활성화 */
  utils: false;
}

@theme {
  --color-primary: #3ea76e;
  --color-primary-dark: #318a57;
  --color-bg-light: #FCFBF9;
  --color-border-default: #D1D5DB;
  --font-sans: 'Pretendard', -apple-system, sans-serif;
}

/* 전역 letter-spacing */
*, *::before, *::after { letter-spacing: -0.07em; }
h1, h2, h3, h4, h5, h6 { letter-spacing: -0.08em; }
```

> **daisyUI 거의 비활성화.** `text-primary` / `bg-primary`만 `@theme` 토큰으로 동작.  
> `text-base-content`, `bg-base-200`, `badge-success` 등 daisyUI 시맨틱 토큰 **사용 불가**.

---

## 브랜드 컬러 시스템

| 용도 | 값 | Tailwind |
|---|---|---|
| 주 브랜드 | `#3ea76e` | `bg-primary` / `text-primary` 또는 `bg-[#3ea76e]` |
| 브랜드 다크 | `#318a57` | `bg-[#318a57]` |
| 딥 그린 | `#1a3d2b` | `bg-[#1a3d2b]` |
| 기본 텍스트 | `#111111` | `text-[#111]` (body 기본값) |
| 보조 텍스트 | `#333`, `#555`, `#666`, `#888`, `#999` | 직접 사용 |
| 배경 | `#FCFBF9` | `bg-[#FCFBF9]` |
| 카드 배경 | `#f9f9f9` | `bg-[#f9f9f9]` |
| 구분선 | `#eee`, `#e0e0e0` | `border-[#eee]` |
| 별점 색상 | `#f5a623` | `text-[#f5a623]` |

---

## index.css 커스텀 버튼 클래스

daisyUI가 아닌 `index.css`에 직접 정의된 커스텀 클래스:

| 클래스 | 용도 | 기본 | Hover/Active |
|---|---|---|---|
| `btn-primary` | 주요 액션 버튼 | `#3ea76e` 배경 + 흰 텍스트 | `#318a57` 배경 |
| `btn-outline` | 보조 버튼 | 초록 테두리 + 초록 텍스트 | 초록 배경 + 흰 텍스트 |
| `btn-ghost` | 서브 버튼 | 회색 테두리 + 회색 텍스트 | 회색 배경 + 흰 텍스트 |
| `hover-primary` | 탭·필터 버튼 | 흰 배경 + 회색 테두리 | 초록 배경 + 흰 텍스트 |
| `btn-capsule` | 캡슐형 선택 버튼 | 흰 배경 + 회색 테두리 | 초록 텍스트·테두리 |

```jsx
// 사용 예시
<button className="btn-primary px-6 py-3 text-[15px]">구매하기</button>
<button className="btn-outline px-6 py-3">취소</button>
<button className={`hover-primary px-6 py-2.5 text-[14px] ${active ? 'active shadow-sm' : ''}`}>
  {cat.name}
</button>
```

---

## 폰트 & 자간

전역 `letter-spacing: -0.07em` 자동 적용 (Pretendard 한국어 최적화).  
Tailwind `tracking-tighter`(-0.05em)로 헤딩에 추가 조정:

```jsx
// 섹션 제목 (랜딩페이지 표준)
<h2 className="text-[24px] font-black text-[#111111] tracking-tighter">

// 상품명
<h3 className="text-[15px] font-bold text-[#111111] tracking-tighter">

// 가격
<p className="text-[18px] font-black text-[#111111] tracking-tighter">

// 본문 텍스트 (전역 -0.07em 적용됨)
<p className="text-[14px] text-[#555]">
```

---

## 랜딩페이지 섹션 레이아웃 표준

각 섹션이 자체 `max-w-[1200px] mx-auto px-6`을 관리 (Layout이 강제 안 함):

```jsx
<div className="bg-white w-full max-w-[1200px] mx-auto px-6">
  <div className="flex items-center justify-start pt-16 pb-8">
    <h2 className="text-[24px] font-black text-[#111111] tracking-tighter">
      {sectionTitle}
    </h2>
  </div>
  {/* 콘텐츠 */}
</div>
```

---

## 상품 카드 패턴

```jsx
// 베스트셀러 (3컬럼, 큰 라운드)
<div className="grid grid-cols-3 gap-10">
  <Link className="flex flex-col group">
    <div className="relative aspect-square overflow-hidden rounded-[24px] mb-5">
      <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
    </div>
    <h3 className="text-[15px] font-bold tracking-tighter line-clamp-1">{name}</h3>
    <p className="text-[18px] font-black tracking-tighter">{price}원</p>
  </Link>
</div>

// 상품 탭 / 포토리뷰 (2→4컬럼 반응형)
<div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
  <Link className="flex flex-col group">
    <div className="relative aspect-square overflow-hidden rounded-[15px] mb-4 bg-[#f9f9f9]">
      <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
    </div>
  </Link>
</div>
```

---

## 상태별 UI 패턴

```jsx
// 로딩 — Spinner 공유 컴포넌트 사용
import Spinner from '@/shared/components/Spinner'
if (isLoading) return <Spinner />

// 에러
if (error) return (
  <div className="text-center py-20 text-[#999]">
    <p className="text-[15px]">오류가 발생했습니다</p>
  </div>
)

// 빈 상태
if (!data?.length) return (
  <div className="text-center py-20 text-[#999]">
    <p className="text-[40px] mb-4">🔍</p>
    <p className="text-[15px]">결과가 없습니다</p>
  </div>
)
```

---

## 반응형 원칙

모바일 퍼스트. 기본 클래스 → `md:` → `lg:` 순으로 확장:

```jsx
className="grid grid-cols-2 md:grid-cols-4 gap-5"
className="hidden lg:flex"
className="text-[40px] md:text-[60px]"
```

---

## 피해야 할 패턴

```jsx
// ❌ 인라인 style 속성 (backgroundImage 같은 복잡한 CSS 제외)
<div style={{ color: '#ff0000', marginTop: '16px' }}>

// ❌ daisyUI 시맨틱 토큰 (비활성화 상태)
<p className="text-base-content/50">   // 정의되지 않아 투명
<div className="bg-base-200">          // 정의되지 않아 무색

// ✅ 브랜드 컬러 직접 사용
<p className="text-[#555]">
<div className="bg-[#f9f9f9]">

// ✅ primary 토큰은 사용 가능 (@theme에 정의됨)
<p className="text-primary">
<button className="bg-primary text-white">
```
