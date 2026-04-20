import { useDispatch } from 'react-redux'

/**
 * 타입 지원 dispatch 훅
 * @returns {import('@reduxjs/toolkit').AppDispatch}
 */
const useAppDispatch = () => useDispatch()
export { useAppDispatch }
export default useAppDispatch
