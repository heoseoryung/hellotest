import { useSelector } from 'react-redux'

/**
 * 타입 지원 selector 훅
 * @template T
 * @param {(state: import('@/store/store').RootState) => T} selector
 * @returns {T}
 */
const useAppSelector = (selector) => useSelector(selector)
export { useAppSelector }
export default useAppSelector
