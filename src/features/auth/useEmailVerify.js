import { useState } from 'react'
import { useSendEmailVerifyMutation, useVerifyEmailMutation } from '@/api/authApi'

export default function useEmailVerify({ onVerified }) {
  const [email, setEmailState] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [verified, setVerified] = useState(false)
  const [sendError, setSendError] = useState('')
  const [verifyError, setVerifyError] = useState('')

  const [sendEmailVerify, { isLoading: isSending }] = useSendEmailVerifyMutation()
  const [verifyEmailMutation, { isLoading: isVerifying }] = useVerifyEmailMutation()

  // 이메일 변경 시 이전 에러·상태 모두 초기화
  const setEmail = (val) => {
    setEmailState(val)
    setCodeSent(false)
    setVerified(false)
    setSendError('')
    setVerifyError('')
  }

  const handleSend = async () => {
    const trimmedEmail = email.trim()
    if (!trimmedEmail) return
    setSendError('')
    try {
      await sendEmailVerify(trimmedEmail).unwrap()
      setCodeSent(true)
      setCode('')
      setVerifyError('')
    } catch (err) {
      setSendError(err?.data?.message || '인증 코드 발송에 실패했습니다.')
    }
  }

  const handleVerify = async () => {
    if (!code) return
    setVerifyError('')
    try {
      const cleanCode    = code.trim().replace(/[^0-9]/g, '')
      const trimmedEmail = email.trim()
      await verifyEmailMutation({ email: trimmedEmail, code: cleanCode }).unwrap()
      setVerified(true)
      setTimeout(() => {
        onVerified(trimmedEmail)
      }, 800)
    } catch (err) {
      setVerifyError(err?.data?.message || '인증번호가 올바르지 않습니다.')
    }
  }

  return {
    email, setEmail,
    code, setCode,
    codeSent,
    verified,
    sendError,
    verifyError,
    isSending,
    isVerifying,
    handleSend,
    handleVerify,
  }
}
