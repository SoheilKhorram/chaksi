'use client'

import { useState } from 'react'
import { SearchIcon, CalendarIcon, XIcon, SlidersHorizontalIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

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
  const [isOpen, setIsOpen] = useState(false)
  const [showFromPicker, setShowFromPicker] = useState(false)
  const [showToPicker, setShowToPicker] = useState(false)

  // Count active filters (excluding search term for the inline search bar)
  const activeAdvancedCount = [
    typeFilter !== 'all',
    paymentFilter !== 'all',
    fromDate !== undefined,
    toDate !== undefined,
  ].filter(Boolean).length

  return (
    <div className="space-y-3.5">
      {/* Inline Search and Advanced Filters Trigger */}
      <div className="flex gap-2 items-center">
        {/* Search Field */}
        <div className="relative flex-1">
          <SearchIcon className="absolute start-3 top-2.5 h-4 w-4 text-zinc-400 dark:text-muted-foreground" />
          <Input
            id="players-search"
            type="text"
            placeholder="جستجوی بازیکنان / هم‌بازی‌ها..."
            value={playersFilter}
            onChange={(e) => setPlayersFilter(e.target.value)}
            className="ps-9 h-10 text-xs bg-white dark:bg-zinc-900/40 border-zinc-200/80 dark:border-zinc-800/80 rounded-xl truncate"
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

        {/* Advanced Filters Button */}
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(true)}
          className={`h-10 px-4 gap-2 rounded-xl text-xs font-bold transition-all active:scale-[0.98] border ${activeAdvancedCount > 0
            ? 'bg-emerald-50/50 border-emerald-500/30 text-emerald-600 hover:bg-emerald-100/50 dark:bg-emerald-950/20 dark:border-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-950/30'
            : 'bg-white dark:bg-zinc-900/40 border-zinc-200/80 dark:border-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-850'
            }`}
        >
          <SlidersHorizontalIcon className={`h-4 w-4 shrink-0 transition-colors ${activeAdvancedCount > 0
            ? 'text-emerald-500 dark:text-emerald-400'
            : 'text-zinc-500 dark:text-zinc-400'
            }`} />
          <span>فیلترهای پیشرفته</span>
          {activeAdvancedCount > 0 && (
            <span className="flex h-4 min-w-[15px] items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[10px] font-bold text-white leading-none">
              {activeAdvancedCount.toLocaleString('fa-IR')}
            </span>
          )}
        </Button>
      </div>

      {/* Interactive Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500 animate-slide-up">
          <span className="font-semibold text-zinc-400 dark:text-zinc-500 me-1">فیلترهای فعال:</span>



          {/* Type Badge */}
          {typeFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-2.5 py-1 rounded-lg border border-zinc-200/50 dark:border-zinc-700/50 font-medium">
              <span>نوع: {typeFilter === 'game' ? 'بازی' : 'تمرین'}</span>
              <button
                onClick={() => setTypeFilter('all')}
                className="text-zinc-400 hover:text-red-500 rounded-full p-0.5"
              >
                <XIcon className="h-3 w-3" />
              </button>
            </span>
          )}

          {/* Payment Badge */}
          {paymentFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-2.5 py-1 rounded-lg border border-zinc-200/50 dark:border-zinc-700/50 font-medium">
              <span>پرداخت: {paymentFilter === 'paid' ? 'تسویه شده' : 'مانده'}</span>
              <button
                onClick={() => setPaymentFilter('all')}
                className="text-zinc-400 hover:text-red-500 rounded-full p-0.5"
              >
                <XIcon className="h-3 w-3" />
              </button>
            </span>
          )}

          {/* From Date Badge */}
          {fromDate && (
            <span className="inline-flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-2.5 py-1 rounded-lg border border-zinc-200/50 dark:border-zinc-700/50 font-medium">
              <span>از تاریخ: {fromDate.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' })}</span>
              <button
                onClick={() => setFromDate(undefined)}
                className="text-zinc-400 hover:text-red-500 rounded-full p-0.5"
              >
                <XIcon className="h-3 w-3" />
              </button>
            </span>
          )}

          {/* To Date Badge */}
          {toDate && (
            <span className="inline-flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-2.5 py-1 rounded-lg border border-zinc-200/50 dark:border-zinc-700/50 font-medium">
              <span>تا تاریخ: {toDate.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' })}</span>
              <button
                onClick={() => setToDate(undefined)}
                className="text-zinc-400 hover:text-red-500 rounded-full p-0.5"
              >
                <XIcon className="h-3 w-3" />
              </button>
            </span>
          )}

          {/* Clear All Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-xs font-semibold text-zinc-400 hover:text-red-500 gap-1 h-7 px-2 hover:bg-transparent"
          >
            پاک کردن همه
          </Button>
        </div>
      )}

      {/* Advanced Filters Dialog Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-visible">
          <DialogHeader className="text-right">
            <DialogTitle>فیلترهای پیشرفته</DialogTitle>
            <DialogDescription className="sr-only">
              تنظیمات فیلترهای پیشرفته برای تاریخچه جلسات
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-right">
            {/* Session Type */}
            <div className="space-y-1.5">
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
            <div className="space-y-1.5">
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
            <div className="space-y-1.5">
              <div className="grid grid-cols-2 gap-3 items-end">
                {/* From Date */}
                <div className="relative">
                  <span className="text-[11px] mb-1 font-semibold text-zinc-400 block">از تاریخ</span>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start text-left font-normal h-9 px-3 border-input bg-transparent dark:bg-input/30 text-xs rounded-xl"
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
                      <div
                        className="fixed inset-0 z-40"
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowFromPicker(false)
                        }}
                      />
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
                  <span className="text-[11px] mb-1.5 font-semibold text-zinc-400 block">تا تاریخ</span>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start text-left font-normal h-9 px-3 border-input bg-transparent dark:bg-input/30 text-xs rounded-xl"
                    onClick={() => {
                      setShowToPicker(!showToPicker)
                      setShowFromPicker(false)
                    }}
                  >
                    <CalendarIcon className="me-2 h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className={toDate ? '' : 'text-muted-foreground'}>
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
                      <div
                        className="fixed inset-0 z-40"
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowToPicker(false)
                        }}
                      />
                      <div className="absolute top-[100%] end-0 z-50 mt-1 rounded-xl border border-zinc-200/80 bg-white p-3 shadow-lg dark:border-zinc-800/80 dark:bg-zinc-950 animate-slide-up">
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
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end border-t border-zinc-100 dark:border-zinc-800/60 pt-4 mt-2">
            <Button
              type="button"
              variant="outline"
              disabled={activeAdvancedCount === 0}
              onClick={() => {
                onClear()
                setIsOpen(false)
              }}
              className="text-xs font-semibold px-4 h-9 rounded-xl border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              پاک کردن همه
            </Button>
            <Button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold px-5 h-9 rounded-xl"
            >
              اعمال فیلترها
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
