import { useState, useTransition, useMemo } from 'react'
import { createPadelSessionAction } from '@/app/actions/padel'
import { PadelSettings, ExtraItemForm } from '../types'

export function useLogSessionForm(settings: PadelSettings, onSuccess?: () => void) {
  const [isPending, startTransition] = useTransition()

  // Form State
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [duration, setDuration] = useState('1.5')
  const [players, setPlayers] = useState('')
  const [type, setType] = useState<'game' | 'training'>('game')
  const [isCustomPrice, setIsCustomPrice] = useState(false)
  const [customPrice, setCustomPrice] = useState('')
  const [extraItems, setExtraItems] = useState<ExtraItemForm[]>([])
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

      const res = await createPadelSessionAction({
        date: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        duration: hours,
        players: players,
        type,
        customPrice: isCustomPrice ? parseFloat(customPrice) || 0 : null,
        extraItems: extras
      })

      if (res.success) {
        // Reset form
        setPlayers('')
        setIsCustomPrice(false)
        setCustomPrice('')
        setExtraItems([])
        setSuccess(true)
        if (onSuccess) {
          setTimeout(() => {
            setSuccess(false)
            onSuccess()
          }, 1000)
        }
      } else {
        setError(res.error || 'خطا در ثبت جلسه')
      }
    })
  }

  const resetForm = () => {
    setSelectedDate(new Date())
    setShowDatePicker(false)
    setDuration('1.5')
    setPlayers('')
    setType('game')
    setIsCustomPrice(false)
    setCustomPrice('')
    setExtraItems([])
    setError(null)
    setSuccess(false)
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
    isPending,
    resetForm
  }
}
