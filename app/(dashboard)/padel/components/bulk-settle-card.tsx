'use client'

import { useState, useMemo, useTransition } from 'react'
import { CalendarIcon, CheckCircle2Icon, Loader2Icon, WalletIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { markSessionsPaidInRangeAction } from '@/app/actions/padel'
import { PadelSession } from '../types'
import { formatPrice } from '../utils'

interface BulkSettleCardProps {
  sessions: PadelSession[]
}

export function BulkSettleCard({ sessions }: BulkSettleCardProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [showStartPicker, setShowStartPicker] = useState(false)
  const [showEndPicker, setShowEndPicker] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)

  // Memoized calculations for selected range
  const unpaidSessionsInRange = useMemo(() => {
    if (!startDate || !endDate) return []
    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)

    return sessions.filter((session) => {
      const sessionDate = new Date(session.date)
      return !session.isPaid && sessionDate >= start && sessionDate <= end
    })
  }, [sessions, startDate, endDate])

  const totalUnpaidCost = useMemo(() => {
    return unpaidSessionsInRange.reduce((sum, s) => sum + s.totalCost, 0)
  }, [unpaidSessionsInRange])

  const handleSettle = () => {
    if (!startDate || !endDate) return
    setError(null)
    setSuccess(false)

    startTransition(async () => {
      const startStr = startDate.toISOString().split('T')[0]
      const endStr = endDate.toISOString().split('T')[0]
      const res = await markSessionsPaidInRangeAction(startStr, endStr)

      if (res.success) {
        setSuccess(true)
        setStartDate(undefined)
        setEndDate(undefined)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(res.error || 'خطا در ثبت تسویه حساب')
      }
    })
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40 relative">
      {/* Background Accent Gradients */}
      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-emerald-500/5 blur-xl" />
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 rounded-full bg-blue-500/5 blur-xl" />
      </div>

      <div className="flex items-center gap-2 mb-4">
        <WalletIcon className="h-5 w-5 text-emerald-500" />
        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">ثبت تسویه حساب بازه‌ای</h3>
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5">
        بازه زمانی مورد نظر خود را انتخاب کنید تا جلسات پرداخت‌نشده آن دوره را به صورت یکجا تسویه کنید.
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg bg-emerald-50 p-3 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 flex items-center gap-1.5">
          <CheckCircle2Icon className="h-4 w-4" />
          <span>تمامی جلسات بازه انتخاب شده با موفقیت تسویه شدند!</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Date pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Start Date */}
          <div className="relative">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">از تاریخ</label>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start text-left font-normal h-9 px-3 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs"
              onClick={() => {
                setShowStartPicker(!showStartPicker)
                setShowEndPicker(false)
              }}
            >
              <CalendarIcon className="me-2 h-4 w-4 text-zinc-400 shrink-0" />
              <span>
                {startDate ? (
                  startDate.toLocaleDateString('fa-IR', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })
                ) : (
                  'انتخاب تاریخ شروع'
                )}
              </span>
            </Button>

            {showStartPicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowStartPicker(false)} />
                <div className="absolute top-[100%] start-0 z-50 mt-1 rounded-xl border border-zinc-200/80 bg-white p-3 shadow-lg dark:border-zinc-800/80 dark:bg-zinc-950 animate-slide-up">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(day) => {
                      setStartDate(day)
                      setShowStartPicker(false)
                    }}
                  />
                </div>
              </>
            )}
          </div>

          {/* End Date */}
          <div className="relative">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">تا تاریخ</label>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start text-left font-normal h-9 px-3 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs"
              onClick={() => {
                setShowEndPicker(!showEndPicker)
                setShowStartPicker(false)
              }}
            >
              <CalendarIcon className="me-2 h-4 w-4 text-zinc-400 shrink-0" />
              <span>
                {endDate ? (
                  endDate.toLocaleDateString('fa-IR', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })
                ) : (
                  'انتخاب تاریخ پایان'
                )}
              </span>
            </Button>

            {showEndPicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowEndPicker(false)} />
                <div className="absolute top-[100%] end-0 z-50 mt-1 rounded-xl border border-zinc-200/80 bg-white p-3 shadow-lg dark:border-zinc-800/80 dark:bg-zinc-950 animate-slide-up">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(day) => {
                      setEndDate(day)
                      setShowEndPicker(false)
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Dynamic calculation result */}
        {startDate && endDate && (
          <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60 p-4 space-y-2 text-xs">
            <div className="flex justify-between text-zinc-500">
              <span>تعداد جلسات پرداخت‌نشده:</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {unpaidSessionsInRange.length.toLocaleString('fa-IR')} جلسه
              </span>
            </div>
            <div className="flex justify-between text-zinc-500 border-t border-zinc-200/50 dark:border-zinc-800/50 pt-2">
              <span>کل مبلغ بدهی تسویه نشده:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                {formatPrice(totalUnpaidCost)}
              </span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={handleSettle}
          disabled={isPending || !startDate || !endDate || unpaidSessionsInRange.length === 0}
          className="w-full font-bold h-10 shadow-sm"
        >
          {isPending ? (
            <>
              <Loader2Icon className="me-2 h-4 w-4 animate-spin" /> در حال تسویه...
            </>
          ) : (
            'تسویه جلسات این بازه'
          )}
        </Button>
      </div>
    </div>
  )
}
