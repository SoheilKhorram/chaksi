import { useState, useTransition } from 'react'
import { savePadelSettingsAction } from '@/app/actions/padel'
import { PadelSettings } from '../types'
import { formatInputNumber, parseInputNumber } from '../utils'

export function useSettingsForm(initialSettings: PadelSettings, onSuccess?: () => void) {
  const [isPending, startTransition] = useTransition()
  const [gamePrice, setGamePrice] = useState(formatInputNumber(initialSettings.gamePrice))
  const [trainingPrice, setTrainingPrice] = useState(formatInputNumber(initialSettings.trainingPrice))
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleGamePriceChange = (val: string) => {
    setGamePrice(formatInputNumber(val))
  }

  const handleTrainingPriceChange = (val: string) => {
    setTrainingPrice(formatInputNumber(val))
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    startTransition(async () => {
      const res = await savePadelSettingsAction(
        parseInputNumber(gamePrice),
        parseInputNumber(trainingPrice)
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
    setGamePrice: handleGamePriceChange,
    trainingPrice,
    setTrainingPrice: handleTrainingPriceChange,
    error,
    success,
    isPending,
    onSubmit
  }
}
