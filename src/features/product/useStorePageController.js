import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSearchProductsQuery } from '@/api/searchApi'
import { useGetCategoriesQuery } from '@/api/categoryApi'
import useAppDispatch from '@/hooks/useAppDispatch'
import useAppSelector from '@/hooks/useAppSelector'
import {
  selectProductPagination,
  selectStoreView,
  setPage,
  setStoreSortLabel,
} from './productSlice'

const SORT_OPTIONS = ['최신순', '판매량순', '낮은가격순', '높은가격순']

const SORT_TYPE_MAP = {
  '최신순':    '최신순',
  '판매량순':  '판매량순',
  '낮은가격순': '가격 낮은순',
  '높은가격순': '가격 높은순',
}

export default function useStorePageController() {
  const dispatch = useAppDispatch()
  const [searchParams] = useSearchParams()
  const { page: currentPage } = useAppSelector(selectProductPagination)
  const { sortLabel } = useAppSelector(selectStoreView)

  // URL이 단일 진실 공급원 — Redux 상태 불필요
  const categoryId    = searchParams.get('categoryId') ?? 'ALL'
  const subCategoryId = searchParams.get('sub') ?? null

  const { data: categories = [] } = useGetCategoriesQuery()
  const activeCategory = categories.find(c => c.id === categoryId)
    ?? { id: 'ALL', name: 'ALL', subCategories: [] }

  // 카테고리 변경 시 페이지 초기화
  useEffect(() => {
    dispatch(setPage(1))
  }, [categoryId, dispatch])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [currentPage, categoryId])

  const { data, isFetching } = useSearchProductsQuery({
    category:    categoryId === 'ALL' ? undefined : categoryId,
    subCategory: subCategoryId ?? undefined,
    sortType:    SORT_TYPE_MAP[sortLabel],
    page:        currentPage - 1,
  })

  const products   = data?.content       ?? []
  const totalPages = data?.totalPages    ?? 1
  const totalCount = data?.totalElements ?? 0

  // { code, name } 구조로 반환 — code를 URL ?sub= 값으로, name을 표시용으로 사용
  const subCategories = (activeCategory.subCategories ?? []).map(s => ({ code: s.code, name: s.name }))
  const showSubTabs   = categoryId !== 'ALL' && subCategories.length > 0

  return {
    sortOptions:     SORT_OPTIONS,
    activeTab:       activeCategory.name,
    activeSubCategory: subCategoryId,
    sortLabel,
    currentPage,
    totalPages,
    totalCount,
    products,
    subCategories,
    showSubTabs,
    isFetching,
    setCurrentPage:   (page) => dispatch(setPage(page)),
    handleSortChange: (lbl)  => dispatch(setStoreSortLabel(lbl)),
  }
}
