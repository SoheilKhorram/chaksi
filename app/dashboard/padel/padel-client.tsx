'use client'

import { useState, useTransition, useMemo } from 'react'
import { 
  TrophyIcon, 
  ClockIcon, 
  DollarSignIcon, 
  PlusIcon, 
  Trash2Icon, 
  UsersIcon, 
  ShoppingBagIcon, 
  CheckIcon, 
  Loader2Icon, 
  Settings2Icon,
  CalendarIcon,
  ActivityIcon
} from 'lucide-react'
import { 
  savePadelSettingsAction, 
  createPadelSessionAction, 
  deletePadelSessionAction 
} from '@/app/actions/padel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'

interface PadelClientProps {
  initialSettings: {
    gamePrice: number
    trainingPrice: number
  }
  initialSessions: {
    id: string
    userId: string
    date: string
    duration: number
    players: string
    type: 'game' | 'training'
    price: number
    extraItems: { name: string; price: number }[]
    totalCost: number
    createdAt: string
    updatedAt: string
  }[]
}

export function PadelClient({ initialSettings, initialSessions }: PadelClientProps) {
  const [isPending, startTransition] = useTransition()
  
  // Settings State
  const [gamePrice, setGamePrice] = useState(initialSettings.gamePrice.toString())
  const [trainingPrice, setTrainingPrice] = useState(initialSettings.trainingPrice.toString())
  const [showSettingsSuccess, setShowSettingsSuccess] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showLogModal, setShowLogModal] = useState(false)

  // Form State
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [duration, setDuration] = useState('1.5')
  const [players, setPlayers] = useState('')
  const [type, setType] = useState<'game' | 'training'>('game')
  const [isCustomPrice, setIsCustomPrice] = useState(false)
  const [customPrice, setCustomPrice] = useState('')
  const [extraItems, setExtraItems] = useState<{ name: string; price: string }[]>([])
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<boolean>(false)

  // Summary Metrics
  const stats = useMemo(() => {
    let totalDuration = 0
    let totalCost = 0
    let extraCost = 0
    let gameCount = 0
    let trainingCount = 0

    initialSessions.forEach(session => {
      totalDuration += session.duration
      totalCost += session.totalCost
      if (session.type === 'game') gameCount++
      else trainingCount++

      session.extraItems.forEach(item => {
        extraCost += item.price
      })
    })

    return {
      totalDuration,
      totalCost,
      extraCost,
      gameCount,
      trainingCount,
      sessionCount: initialSessions.length
    }
  }, [initialSessions])

  // Calculated Preview Price
  const calculatedPreviewPrice = useMemo(() => {
    const hours = parseFloat(duration) || 0
    if (isCustomPrice) {
      return parseFloat(customPrice) || 0
    }
    const rate = type === 'game' ? parseFloat(gamePrice) : parseFloat(trainingPrice)
    return hours * (rate || 0)
  }, [duration, type, gamePrice, trainingPrice, isCustomPrice, customPrice])

  // Calculated Extra Cost Preview
  const calculatedExtraCostPreview = useMemo(() => {
    return extraItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0)
  }, [extraItems])

  // Calculated Total Preview
  const calculatedTotalPreview = useMemo(() => {
    return calculatedPreviewPrice + calculatedExtraCostPreview
  }, [calculatedPreviewPrice, calculatedExtraCostPreview])

  // Save Settings handler
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    
    startTransition(async () => {
      const res = await savePadelSettingsAction(
        parseFloat(gamePrice) || 0,
        parseFloat(trainingPrice) || 0
      )
      if (res.success) {
        setShowSettingsSuccess(true)
        setTimeout(() => {
          setShowSettingsSuccess(false)
          setShowSettingsModal(false)
        }, 1000)
      } else {
        setFormError(res.error || 'خطا در ذخیره تنظیمات')
      }
    })
  }

  // Create Session handler
  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(false)

    const hours = parseFloat(duration)
    if (isNaN(hours) || hours <= 0) {
      setFormError('مدت زمان باید یک عدد مثبت باشد.')
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
        setFormSuccess(true)
        setTimeout(() => {
          setFormSuccess(false)
          setShowLogModal(false)
        }, 1000)
      } else {
        setFormError(res.error || 'خطا در ثبت جلسه')
      }
    })
  }

  // Delete session handler
  const handleDeleteSession = (id: string) => {
    if (!confirm('آیا از حذف این جلسه مطمئن هستید؟')) return
    
    startTransition(async () => {
      await deletePadelSessionAction(id)
    })
  }

  // Add extra item row
  const addExtraItemRow = () => {
    setExtraItems([...extraItems, { name: '', price: '' }])
  }

  // Remove extra item row
  const removeExtraItemRow = (index: number) => {
    setExtraItems(extraItems.filter((_, i) => i !== index))
  }

  // Update extra item row
  const updateExtraItem = (index: number, key: 'name' | 'price', value: string) => {
    const newItems = [...extraItems]
    newItems[index][key] = value
    setExtraItems(newItems)
  }

  // Format currency
  const formatPrice = (val: number) => {
    return `${val.toLocaleString('fa-IR')} تومان`
  }

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">مدیریت پدل</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">جلسات بازی، تمرینات، نرخ‌ها و هزینه‌های زمین خود را ثبت و ردیابی کنید.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowSettingsModal(true)}
            className="h-10 w-10 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            title="نرخ‌های ساعتی پیش‌فرض"
          >
            <Settings2Icon className="h-4.5 w-4.5" />
          </Button>
          <Button
            onClick={() => setShowLogModal(true)}
            className="h-10 font-bold px-4 gap-2 shadow-xs transition-transform active:scale-[0.98]"
          >
            <PlusIcon className="h-4 w-4" />
            ثبت جلسه جدید
          </Button>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Total Cost */}
        <div className="relative overflow-hidden rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/50 backdrop-blur-md">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-primary/10 blur-xl"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">مجموع هزینه شده</span>
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <DollarSignIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{formatPrice(stats.totalCost)}</h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {formatPrice(stats.totalCost - stats.extraCost)} پایه + {formatPrice(stats.extraCost)} جانبی
            </p>
          </div>
        </div>

        {/* Metric 2: Total Hours */}
        <div className="relative overflow-hidden rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/50 backdrop-blur-md">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-emerald-500/10 blur-xl"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">کل زمان بازی</span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500">
              <ClockIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{stats.totalDuration.toLocaleString('fa-IR')} ساعت</h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              در {stats.sessionCount.toLocaleString('fa-IR')} جلسه ثبت‌شده
            </p>
          </div>
        </div>

        {/* Metric 3: Games */}
        <div className="relative overflow-hidden rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/50 backdrop-blur-md">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-amber-500/10 blur-xl"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">بازی‌های انجام‌شده</span>
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-500">
              <TrophyIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{stats.gameCount.toLocaleString('fa-IR')}</h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">مسابقات با دوستان / حریفان</p>
          </div>
        </div>

        {/* Metric 4: Training */}
        <div className="relative overflow-hidden rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/50 backdrop-blur-md">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-blue-500/10 blur-xl"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">تمرین‌های ثبت‌شده</span>
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
              <ActivityIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{stats.trainingCount.toLocaleString('fa-IR')}</h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">جلسات تمرینی با مربی یا انفرادی</p>
          </div>
        </div>
      </div>

      {/* Session History */}
      <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">تاریخچه جلسات</h2>
            <span className="text-xs font-medium bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-full dark:bg-zinc-800 dark:text-zinc-300">
              در مجموع {initialSessions.length.toLocaleString('fa-IR')} مورد
            </span>
          </div>

          {initialSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 p-12 text-center dark:border-zinc-800">
              <div className="rounded-full bg-zinc-100 p-4 dark:bg-zinc-900">
                <TrophyIcon className="h-8 w-8 text-zinc-400" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">هنوز هیچ جلسه‌ای ثبت نشده است</h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
                با تنظیم نرخ‌های پیش‌فرض و ثبت اولین جلسه بازی یا تمرین خود، کار را شروع کنید.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {initialSessions.map((session) => (
                <div 
                  key={session.id}
                  className={`group relative overflow-hidden rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md dark:bg-zinc-900/40 dark:hover:bg-zinc-900/60
                    ${session.type === 'game' 
                      ? 'border-l-4 border-l-emerald-500 border-zinc-200/80 dark:border-zinc-800/80' 
                      : 'border-l-4 border-l-blue-500 border-zinc-200/80 dark:border-zinc-800/80'}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Info Side */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold
                          ${session.type === 'game' 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' 
                            : 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'}`}
                        >
                          {session.type === 'game' ? 'بازی / مسابقه' : 'تمرین'}
                        </span>
                        <span className="text-xs text-zinc-400 dark:text-zinc-500">•</span>
                        <span className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                          <CalendarIcon className="h-3 w-3" />
                          {new Date(session.date).toLocaleDateString('fa-IR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-zinc-800 dark:text-zinc-200 font-semibold">
                          <ClockIcon className="h-4 w-4 text-zinc-400" />
                          {session.duration.toLocaleString('fa-IR')} ساعت
                        </div>
                        {session.players && (
                          <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                            <UsersIcon className="h-4 w-4 text-zinc-400" />
                            <span className="truncate max-w-[200px]" title={session.players}>{session.players}</span>
                          </div>
                        )}
                      </div>

                      {/* Extra Items badges */}
                      {session.extraItems.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <ShoppingBagIcon className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                          {session.extraItems.map((item, i) => (
                            <span 
                              key={i} 
                              className="inline-flex items-center text-[11px] font-medium bg-zinc-50 border border-zinc-200 text-zinc-600 px-2 py-0.5 rounded dark:bg-zinc-800/80 dark:border-zinc-700 dark:text-zinc-300"
                            >
                              {item.name} ({formatPrice(item.price)})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Cost & Action Side */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:text-right shrink-0">
                      <div>
                        <div className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                          {formatPrice(session.totalCost)}
                        </div>
                        <div className="text-xs text-zinc-400 dark:text-zinc-500">
                          هزینه جلسه: {formatPrice(session.price)}
                          {session.extraItems.length > 0 && ` + هزینه‌های جانبی`}
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-red-500 dark:hover:bg-red-500/10 hover:bg-red-50"
                        onClick={() => handleDeleteSession(session.id)}
                        disabled={isPending}
                      >
                        <Trash2Icon className="h-4.5 w-4.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div 
            className="fixed inset-0" 
            onClick={() => setShowSettingsModal(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-950 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Settings2Icon className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">نرخ‌های ساعتی پیش‌فرض</h3>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                onClick={() => setShowSettingsModal(false)}
              >
                <span className="sr-only">بستن</span>
                <span className="text-xl leading-none">×</span>
              </Button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="modal-gamePrice">نرخ بازی (تومان/ساعت)</Label>
                  <Input
                    id="modal-gamePrice"
                    type="number"
                    min="0"
                    step="1"
                    value={gamePrice}
                    onChange={(e) => setGamePrice(e.target.value)}
                    placeholder="مثال: ۱۰۰۰۰۰"
                    required
                    className="h-9 bg-zinc-50 dark:bg-zinc-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="modal-trainingPrice">نرخ تمرین (تومان/ساعت)</Label>
                  <Input
                    id="modal-trainingPrice"
                    type="number"
                    min="0"
                    step="1"
                    value={trainingPrice}
                    onChange={(e) => setTrainingPrice(e.target.value)}
                    placeholder="مثال: ۱۵۰۰۰۰"
                    required
                    className="h-9 bg-zinc-50 dark:bg-zinc-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSettingsModal(false)}
                  className="h-9 text-xs"
                >
                  انصراف
                </Button>
                <Button 
                  type="submit" 
                  disabled={isPending}
                  className="h-9 text-xs font-semibold px-4"
                >
                  {isPending && <Loader2Icon className="me-1.5 h-3.5 w-3.5 animate-spin" />}
                  ذخیره نرخ‌ها
                </Button>
              </div>
              
              {showSettingsSuccess && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-semibold justify-end animate-fade-in mt-2">
                  <CheckIcon className="h-4 w-4" /> ذخیره شد!
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Log Session Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div 
            className="fixed inset-0" 
            onClick={() => setShowLogModal(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950 animate-slide-up my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">ثبت جلسه جدید</h2>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                onClick={() => setShowLogModal(false)}
              >
                <span className="sr-only">بستن</span>
                <span className="text-xl leading-none">×</span>
              </Button>
            </div>

            {formError && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400">
                {formError}
              </div>
            )}

            {formSuccess && (
              <div className="mb-4 rounded-lg bg-emerald-50 p-3 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                جلسه با موفقیت ثبت شد!
              </div>
            )}

            <form onSubmit={(e) => { handleCreateSession(e); setShowLogModal(false); }} className="space-y-4">
              {/* Type Switcher */}
              <div className="space-y-1.5">
                <Label>نوع جلسه</Label>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  <button
                    type="button"
                    onClick={() => setType('game')}
                    className={`py-1.5 text-xs font-semibold rounded-md transition-all
                      ${type === 'game' 
                        ? 'bg-white text-emerald-600 shadow-sm dark:bg-zinc-900 dark:text-emerald-400' 
                        : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'}`}
                  >
                    بازی / مسابقه
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('training')}
                    className={`py-1.5 text-xs font-semibold rounded-md transition-all
                      ${type === 'training' 
                        ? 'bg-white text-blue-600 shadow-sm dark:bg-zinc-900 dark:text-blue-400' 
                        : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'}`}
                  >
                    تمرین
                  </button>
                </div>
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <Label htmlFor="date">تاریخ</Label>
                <div className="relative">
                  <Button
                    id="date"
                    type="button"
                    variant="outline"
                    className="w-full justify-start text-left font-normal h-9 px-3 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
                    onClick={() => setShowDatePicker(!showDatePicker)}
                  >
                    <CalendarIcon className="me-2 h-4 w-4 text-zinc-400" />
                    {selectedDate ? (
                      selectedDate.toLocaleDateString('fa-IR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    ) : (
                      <span className="text-zinc-400">انتخاب تاریخ</span>
                    )}
                  </Button>
                  
                  {showDatePicker && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowDatePicker(false)}
                      />
                      <div className="absolute top-[100%] start-0 z-50 mt-1 rounded-xl border border-zinc-200/80 bg-white p-3 shadow-lg dark:border-zinc-800/80 dark:bg-zinc-950 animate-slide-up">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(day) => {
                            setSelectedDate(day)
                            setShowDatePicker(false)
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Duration with Preset Buttons */}
              <div className="space-y-1.5">
                <Label htmlFor="duration">مدت زمان (ساعت)</Label>
                <div className="flex gap-2">
                  <Input
                    id="duration"
                    type="number"
                    min="0.1"
                    max="12"
                    step="0.1"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    required
                    className="h-9"
                  />
                  {['1.0', '1.5', '2.0'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setDuration(val)}
                      className={`px-3 text-xs font-medium border border-zinc-200 rounded-lg hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800 transition-colors
                        ${duration === val ? 'bg-zinc-100 border-zinc-300 dark:bg-zinc-800 dark:border-zinc-700' : ''}`}
                    >
                      {parseFloat(val).toLocaleString('fa-IR')} ساعت
                    </button>
                  ))}
                </div>
              </div>

              {/* Who did you play with */}
              <div className="space-y-1.5">
                <Label htmlFor="players">هم‌بازی‌ها</Label>
                <Input
                  id="players"
                  type="text"
                  value={players}
                  onChange={(e) => setPlayers(e.target.value)}
                  placeholder="مثال: علی، رضا، سارا"
                  className="h-9"
                />
              </div>

              {/* Price Customization Toggle */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="custom-price-toggle" className="cursor-pointer">قیمت‌گذاری سفارشی</Label>
                  <input
                    id="custom-price-toggle"
                    type="checkbox"
                    checked={isCustomPrice}
                    onChange={(e) => setIsCustomPrice(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-primary focus:ring-primary cursor-pointer"
                  />
                </div>
                {isCustomPrice && (
                  <div className="space-y-1.5 animate-slide-up">
                    <Label htmlFor="customPrice">قیمت سفارشی (تومان)</Label>
                    <Input
                      id="customPrice"
                      type="number"
                      min="0"
                      step="1"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(e.target.value)}
                      placeholder="هزینه کل جلسه را وارد کنید"
                      required={isCustomPrice}
                      className="h-9"
                    />
                  </div>
                )}
              </div>

              {/* Extra Items List */}
              <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">خرید اقلام جانبی</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs gap-1 border-dashed"
                    onClick={addExtraItemRow}
                  >
                    <PlusIcon className="h-3 w-3" /> افزودن آیتم
                  </Button>
                </div>

                {extraItems.length > 0 && (
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {extraItems.map((item, index) => (
                      <div key={index} className="flex gap-2 items-center animate-slide-up">
                        <Input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateExtraItem(index, 'name', e.target.value)}
                          placeholder="مثال: گریپ، آب، توپ"
                          required
                          className="h-8 text-xs flex-1"
                        />
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={item.price}
                          onChange={(e) => updateExtraItem(index, 'price', e.target.value)}
                          placeholder="۰"
                          required
                          className="h-8 text-xs w-20"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-400 hover:text-red-500"
                          onClick={() => removeExtraItemRow(index)}
                        >
                          <Trash2Icon className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Preview Block */}
              <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-4 dark:bg-zinc-900/40 dark:border-zinc-800/80 text-xs space-y-2">
                <div className="flex justify-between text-zinc-500">
                  <span>هزینه جلسه:</span>
                  <span>{formatPrice(calculatedPreviewPrice)}</span>
                </div>
                {extraItems.length > 0 && (
                  <div className="flex justify-between text-zinc-500">
                    <span>اقلام جانبی:</span>
                    <span>{formatPrice(calculatedExtraCostPreview)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-zinc-900 dark:text-zinc-50 border-t border-zinc-200/50 dark:border-zinc-800/50 pt-2 text-sm">
                  <span>مجموع کل تقریبی:</span>
                  <span>{formatPrice(calculatedTotalPreview)}</span>
                </div>
              </div>

              {/* Submit Session */}
              <Button 
                type="submit" 
                disabled={isPending}
                className="w-full font-bold h-10 shadow-sm shadow-primary/10 transition-transform active:scale-[0.98]"
              >
                {isPending ? (
                  <>
                    <Loader2Icon className="me-2 h-4 w-4 animate-spin" /> در حال ثبت...
                  </>
                ) : (
                  'ثبت جلسه پدل'
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
