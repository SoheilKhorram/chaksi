'use client'

import { useState } from 'react'
import { SearchIcon, CalendarIcon, XIcon, SlidersHorizontalIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface SessionFiltersProps {
  playersFilter: string
  setPlayersFilter: (val: string) => void
  typeFilter: 'all' | 'game' | 'training'
  setTypeFilter: (val: 'all' | 'game' | 'training') => void
  paymentFilter: 'all' | 'paid' | 'unpaid'
  setPaymentFilter: (val: 'all' | 'paid' | 'unpaid') => void
  fromDate: Date | undefined
  setFromDate: (date: Date | undefined) => void
  toDate: Date | undefined
  setToDate: (date: Date | undefined) => void
  onClear: () => void
  hasActiveFilters: boolean
}

export function SessionFilters({
  playersFilter,
  setPlayersFilter,
  typeFilter,
  setTypeFilter,
  paymentFilter,
  setPaymentFilter,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  onClear,
  hasActiveFilters,
}: SessionFiltersProps) {
  const [showFromPicker, setShowFromPicker] = useState(false)
  const [showToPicker, setShowToPicker] = useState(false)

  console.log(hasActiveFilters)

  return (
    <div className="relative z-20 rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/40 backdrop-blur-md space-y-4">
      <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50 font-bold text-sm">
        <SlidersHorizontalIcon className="h-4 w-4 text-zinc-500" />
        <span>فیلتر کردن جلسات</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        {/* Search Players */}
        <div className="space-y-1.5 md:col-span-4">
          <label htmlFor="players-search" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            جستجوی بازیکنان / هم‌بازی‌ها
          </label>
          <div className="relative">
            <SearchIcon className="absolute start-3 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
              id="players-search"
              type="text"
              placeholder="مثال: علی، رضا..."
              value={playersFilter}
              onChange={(e) => setPlayersFilter(e.target.value)}
              className="ps-9 h-9 text-xs"
            />
            {playersFilter && (
              <button
                onClick={() => setPlayersFilter('')}
                className="absolute end-3 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <XIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Session Type */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">نوع جلسه</label>
          <Tabs
            value={typeFilter}
            onValueChange={(val) => setTypeFilter(val as 'all' | 'game' | 'training')}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 w-full min-h-9 p-[3px] bg-zinc-100 dark:bg-input/30">
              <TabsTrigger
                value="all"
                className="text-xs font-semibold h-7 data-active:text-zinc-900 dark:data-active:text-zinc-50"
              >
                همه
              </TabsTrigger>
              <TabsTrigger
                value="game"
                className="text-xs font-semibold h-7 data-active:text-emerald-600 dark:data-active:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-400"
              >
                بازی
              </TabsTrigger>
              <TabsTrigger
                value="training"
                className="text-xs font-semibold h-7 data-active:text-blue-600 dark:data-active:text-blue-400 hover:text-blue-500 dark:hover:text-blue-400"
              >
                تمرین
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Payment Status */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">وضعیت پرداخت</label>
          <Tabs
            value={paymentFilter}
            onValueChange={(val) => setPaymentFilter(val as 'all' | 'paid' | 'unpaid')}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 w-full min-h-9 p-[3px] bg-zinc-100 dark:bg-input/30">
              <TabsTrigger
                value="all"
                className="text-xs font-semibold h-7 data-active:text-zinc-900 dark:data-active:text-zinc-50"
              >
                همه
              </TabsTrigger>
              <TabsTrigger
                value="paid"
                className="text-xs font-semibold h-7 data-active:text-emerald-600 dark:data-active:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-400"
              >
                تسویه
              </TabsTrigger>
              <TabsTrigger
                value="unpaid"
                className="text-xs font-semibold h-7 data-active:text-amber-600 dark:data-active:text-amber-400 hover:text-amber-500 dark:hover:text-amber-400"
              >
                مانده
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Date Ranges */}
        <div className="grid grid-cols-2 gap-2 md:col-span-4 items-end">
          {/* From Date */}
          <div className="relative">
            <label className="text-xs mb-1 font-semibold text-zinc-500 dark:text-zinc-400">از تاریخ</label>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start text-left font-normal h-9 px-3 border-input bg-transparent dark:bg-input/30 text-xs"
              onClick={() => {
                setShowFromPicker(!showFromPicker)
                setShowToPicker(false)
              }}
            >
              <CalendarIcon className="me-2 h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className={fromDate ? '' : 'text-muted-foreground'}>
                {fromDate ? (
                  fromDate.toLocaleDateString('fa-IR', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })
                ) : (
                  'انتخاب تاریخ'
                )}
              </span>
            </Button>

            {showFromPicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowFromPicker(false)} />
                <div className="absolute top-[100%] start-0 z-50 mt-1 rounded-xl border border-zinc-200/80 bg-white p-3 shadow-lg dark:border-zinc-800/80 dark:bg-zinc-950 animate-slide-up">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={(day) => {
                      setFromDate(day)
                      setShowFromPicker(false)
                    }}
                  />
                </div>
              </>
            )}
          </div>

          {/* To Date */}
          <div className="relative">
            <label className="text-xs mb-1.5 font-semibold text-zinc-500 dark:text-zinc-400">تا تاریخ</label>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start text-left font-normal h-9 px-3 border-input bg-transparent dark:bg-input/30 text-xs"
              onClick={() => {
                setShowToPicker(!showToPicker)
                setShowFromPicker(false)
              }}
            >
              <CalendarIcon className="me-2 h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className={toDate ? '' : 'text-muted-foreground'} >
                {toDate ? (
                  toDate.toLocaleDateString('fa-IR', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })
                ) : (
                  'انتخاب تاریخ'
                )}
              </span>
            </Button>


            {showToPicker && (
              <>
                <div className="w-0 h-0" onClick={() => setShowToPicker(false)} />
                <div className="absolute top-[100%] end-0 z-50 mt-2 rounded-xl border border-zinc-200/80 bg-white p-3 shadow-lg dark:border-zinc-800/80 dark:bg-zinc-950 animate-slide-up">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={(day) => {
                      setToDate(day)
                      setShowToPicker(false)
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex justify-end pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-xs font-semibold text-zinc-500 hover:text-red-500 gap-1.5 h-8 px-3"
          >
            <XIcon className="h-3.5 w-3.5" />
            پاک کردن فیلترها
          </Button>
        </div>
      )}
    </div>
  )
}
