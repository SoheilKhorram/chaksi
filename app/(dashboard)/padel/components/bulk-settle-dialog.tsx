'use client'

import { useState, useMemo, useTransition } from 'react'
import { CalendarIcon, CheckCircle2Icon, Loader2Icon, WalletIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { markSessionsPaidInRangeAction, markAllSessionsPaidAction } from '@/app/actions/padel'
import { PadelSession } from '../types'
import { formatPrice, toLocalDateString } from '../utils'

import { ConfirmRangeSettleDialog } from './confirm-range-settle-dialog'
import { ConfirmAllSettleDialog } from './confirm-all-settle-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface BulkSettleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sessions: PadelSession[]
}

export function BulkSettleDialog({ open, onOpenChange, sessions }: BulkSettleDialogProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [showStartPicker, setShowStartPicker] = useState(false)
  const [showEndPicker, setShowEndPicker] = useState(false)
  const [isSettlePending, startSettleTransition] = useTransition()
  const [isSettleAllPending, startSettleAllTransition] = useTransition()
  const [showConfirmSettle, setShowConfirmSettle] = useState(false)
  const [showConfirmSettleAll, setShowConfirmSettleAll] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)

  const totalUnpaidSessionsCount = useMemo(() => {
    return sessions.filter((session) => !session.isPaid).length
  }, [sessions])

  const handleSettleAll = () => {
    setError(null)
    setSuccess(false)

    startSettleAllTransition(async () => {
      const res = await markAllSessionsPaidAction()

      if (res.success) {
        setSuccess(true)
        setStartDate(undefined)
        setEndDate(undefined)
        setShowConfirmSettleAll(false)
        setTimeout(() => {
          setSuccess(false)
          onOpenChange(false)
        }, 2000)
      } else {
        setError(res.error || 'خطا در ثبت تسویه حساب کامل')
        setShowConfirmSettleAll(false)
      }
    })
  }

  const unpaidSessionsInRange = useMemo(() => {
    if (!startDate || !endDate) return []
    const startStr = toLocalDateString(startDate)
    const endStr = toLocalDateString(endDate)

    return sessions.filter((session) => {
      const sessionDateStr = session.date.split('T')[0]
      return !session.isPaid && sessionDateStr >= startStr && sessionDateStr <= endStr
    })
  }, [sessions, startDate, endDate])

  const totalUnpaidCost = useMemo(() => {
    return unpaidSessionsInRange.reduce((sum, s) => sum + s.totalCost, 0)
  }, [unpaidSessionsInRange])

  const handleSettle = () => {
    if (!startDate || !endDate) return
    setError(null)
    setSuccess(false)

    startSettleTransition(async () => {
      const startStr = toLocalDateString(startDate)
      const endStr = toLocalDateString(endDate)
      const res = await markSessionsPaidInRangeAction(startStr, endStr)

      if (res.success) {
        setSuccess(true)
        setStartDate(undefined)
        setEndDate(undefined)
        setShowConfirmSettle(false)
        setTimeout(() => {
          setSuccess(false)
          onOpenChange(false)
        }, 2000)
      } else {
        setError(res.error || 'خطا در ثبت تسویه حساب')
        setShowConfirmSettle(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-right">
            <WalletIcon className="h-5 w-5 text-emerald-500" />
            <span>ثبت تسویه حساب بازه‌ای</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 text-right">
            بازه زمانی رو انتخاب کن تا جلسات پرداخت‌نشده این دوره یکجا تسویه شه
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400 text-right">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg bg-emerald-50 p-3 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 flex items-center gap-1.5 justify-end animate-pulse">
            <CheckCircle2Icon className="h-4 w-4" />
            <span>تمامی جلسات بازه انتخاب شده با موفقیت تسویه شدند!</span>
          </div>
        )}

        <div className="space-y-4 pt-2 text-right">
          {/* Date pickers */}
          <div className="grid grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="relative">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">از تاریخ</label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-left font-normal h-9 px-3 border-input bg-transparent dark:bg-input/30 text-xs"
                onClick={() => {
                  setShowStartPicker(!showStartPicker)
                  setShowEndPicker(false)
                }}
              >
                <CalendarIcon className="me-2 h-4 w-4 text-muted-foreground shrink-0" />
                <span className={startDate ? '' : 'text-muted-foreground'}>
                  {startDate ? (
                    startDate.toLocaleDateString('fa-IR', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })
                  ) : (
                    'انتخاب تاریخ'
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
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">تا تاریخ</label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-left font-normal h-9 px-3 border-input bg-transparent dark:bg-input/30 text-xs"
                onClick={() => {
                  setShowEndPicker(!showEndPicker)
                  setShowStartPicker(false)
                }}
              >
                <CalendarIcon className="me-2 h-4 w-4 text-muted-foreground shrink-0" />
                <span className={endDate ? '' : 'text-muted-foreground'}>
                  {endDate ? (
                    endDate.toLocaleDateString('fa-IR', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })
                  ) : (
                    'انتخاب تاریخ'
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

          {/* Action Buttons Wrapper */}
          <div className="flex flex-col sm:flex-row w-full gap-3 pt-2">
            <Button
              onClick={() => setShowConfirmSettle(true)}
              disabled={isSettlePending || isSettleAllPending || !startDate || !endDate || unpaidSessionsInRange.length === 0}
              className="flex-1 min-h-8 sm:h-10 text-xs sm:text-sm shadow-sm px-4 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isSettlePending ? (
                <>
                  <Loader2Icon className="me-2 h-4 w-4 animate-spin" /> در حال تسویه...
                </>
              ) : (
                'تسویه جلسات این بازه'
              )}
            </Button>

            {totalUnpaidSessionsCount > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowConfirmSettleAll(true)}
                disabled={isSettlePending || isSettleAllPending}
                className="flex-1 min-h-8 sm:h-10 px-4 text-xs sm:text-sm border-dashed border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-800/40 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
              >
                {isSettleAllPending ? (
                  <>
                    <Loader2Icon className="me-2 h-4 w-4 animate-spin" /> در حال تسویه...
                  </>
                ) : (
                  `تسویه کل جلسات (${totalUnpaidSessionsCount.toLocaleString('fa-IR')})`
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Confirmation Dialog for Range Settlement */}
        <ConfirmRangeSettleDialog
          open={showConfirmSettle}
          onOpenChange={setShowConfirmSettle}
          unpaidSessionsCount={unpaidSessionsInRange.length}
          startDate={startDate}
          endDate={endDate}
          totalCost={totalUnpaidCost}
          onConfirm={handleSettle}
          isPending={isSettlePending}
        />

        {/* Confirmation Dialog for All Settlement */}
        <ConfirmAllSettleDialog
          open={showConfirmSettleAll}
          onOpenChange={setShowConfirmSettleAll}
          totalUnpaidSessionsCount={totalUnpaidSessionsCount}
          onConfirm={handleSettleAll}
          isPending={isSettleAllPending}
        />
      </DialogContent>
    </Dialog>
  )
}
