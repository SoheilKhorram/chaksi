import { useState, useTransition, useMemo } from 'react'
import { updatePadelSessionAction } from '@/app/actions/padel'
import { PadelSession, PadelSettings, ExtraItemForm } from '../types'

export function useEditSessionForm(
  session: PadelSession,
  settings: PadelSettings,
  onSuccess?: () => void
) {
  const [isPending, startTransition] = useTransition()

  // Determine if it was a custom price or using settings rates
  const initialIsCustom = useMemo(() => {
    const rate = session.type === 'game' ? settings.gamePrice : settings.trainingPrice
    const standardPrice = session.duration * rate
    return Math.abs(standardPrice - session.price) > 0.01
  }, [session, settings])

  // Form State
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(session.date))
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [duration, setDuration] = useState(session.duration.toString())
  const [players, setPlayers] = useState(session.players)
  const [type, setType] = useState<'game' | 'training'>(session.type)
  const [isCustomPrice, setIsCustomPrice] = useState(initialIsCustom)
  const [customPrice, setCustomPrice] = useState(initialIsCustom ? session.price.toString() : '')
  const [extraItems, setExtraItems] = useState<ExtraItemForm[]>(
    session.extraItems.map(item => ({
      name: item.name,
      price: item.price.toString()
    }))
  )
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)

  // Calculated Previews
  const calculatedPreviewPrice = useMemo(() => {
    const hours = parseFloat(duration) || 0
    if (isCustomPrice) {
      return parseFloat(customPrice) || 0
    }
    const rate = type === 'game' ? settings.gamePrice : settings.trainingPrice
    return hours * (rate || 0)
  }, [duration, type, settings.gamePrice, settings.trainingPrice, isCustomPrice, customPrice])

  const calculatedExtraCostPreview = useMemo(() => {
    return extraItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0)
  }, [extraItems])

  const calculatedTotalPreview = useMemo(() => {
    return calculatedPreviewPrice + calculatedExtraCostPreview
  }, [calculatedPreviewPrice, calculatedExtraCostPreview])

  // Extra Item Actions
  const addExtraItemRow = () => {
    setExtraItems([...extraItems, { name: '', price: '' }])
  }

  const removeExtraItemRow = (index: number) => {
    setExtraItems(extraItems.filter((_, i) => i !== index))
  }

  const updateExtraItem = (index: number, key: 'name' | 'price', value: string) => {
    const newItems = [...extraItems]
    newItems[index][key] = value
    setExtraItems(newItems)
  }

  // Submit Handler
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    const hours = parseFloat(duration)
    if (isNaN(hours) || hours <= 0) {
      setError('مدت زمان باید یک عدد مثبت باشد.')
      return
    }

    startTransition(async () => {
      const extras = extraItems
        .filter(item => item.name.trim() !== '')
        .map(item => ({
          name: item.name.trim(),
          price: parseFloat(item.price) || 0
        }))

      const res = await updatePadelSessionAction(session.id, {
        date: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        duration: hours,
        players: players,
        type,
        customPrice: isCustomPrice ? parseFloat(customPrice) || 0 : null,
        extraItems: extras
      })

      if (res.success) {
        setSuccess(true)
        if (onSuccess) {
          setTimeout(() => {
            setSuccess(false)
            onSuccess()
          }, 1000)
        }
      } else {
        setError(res.error || 'خطا در ویرایش جلسه')
      }
    })
  }

  return {
    selectedDate,
    setSelectedDate,
    showDatePicker,
    setShowDatePicker,
    duration,
    setDuration,
    players,
    setPlayers,
    type,
    setType,
    isCustomPrice,
    setIsCustomPrice,
    customPrice,
    setCustomPrice,
    extraItems,
    error,
    success,
    calculatedPreviewPrice,
    calculatedExtraCostPreview,
    calculatedTotalPreview,
    addExtraItemRow,
    removeExtraItemRow,
    updateExtraItem,
    onSubmit,
    isPending
  }
}
