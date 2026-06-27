import { useState, useTransition } from 'react'
import { savePadelSettingsAction } from '@/app/actions/padel'
import { PadelSettings } from '../types'

export function useSettingsForm(initialSettings: PadelSettings, onSuccess?: () => void) {
  const [isPending, startTransition] = useTransition()
  const [gamePrice, setGamePrice] = useState(initialSettings.gamePrice.toString())
  const [trainingPrice, setTrainingPrice] = useState(initialSettings.trainingPrice.toString())
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    startTransition(async () => {
      const res = await savePadelSettingsAction(
        parseFloat(gamePrice) || 0,
        parseFloat(trainingPrice) || 0
      )
      if (res.success) {
        setSuccess(true)
        if (onSuccess) {
          setTimeout(() => {
            setSuccess(false)
            onSuccess()
          }, 1000)
        }
      } else {
        setError(res.error || 'خطا در ذخیره تنظیمات')
      }
    })
  }

  return {
    gamePrice,
    setGamePrice,
    trainingPrice,
    setTrainingPrice,
    error,
    success,
    isPending,
    onSubmit
  }
}
