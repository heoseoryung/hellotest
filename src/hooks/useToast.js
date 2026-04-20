import useAppDispatch from './useAppDispatch'
import { addToast } from '@/features/ui/uiSlice'

/**
 * 토스트 알림 편의 훅
 * @returns {{ success: Function, error: Function, warning: Function, info: Function }}
 */
const useToast = () => {
  const dispatch = useAppDispatch()

  const show = (type, message, duration = 3000) => {
    dispatch(addToast({ type, message, duration }))
  }

  return {
    success: (msg, dur) => show('success', msg, dur),
    error:   (msg, dur) => show('error',   msg, dur),
    warning: (msg, dur) => show('warning', msg, dur),
    info:    (msg, dur) => show('info',    msg, dur),
  }
}

export default useToast
