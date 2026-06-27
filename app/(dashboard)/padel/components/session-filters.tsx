'use client'

import { useState } from 'react'
import { SearchIcon, CalendarIcon, XIcon, SlidersHorizontalIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'

interface SessionFiltersProps {
  playersFilter: string
  setPlayersFilter: (val: string) => void
  typeFilter: 'all' | 'game' | 'training'
  setTypeFilter: (val: 'all' | 'game' | 'training') => void
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
              className="ps-9 h-9"
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
        <div className="space-y-1.5 md:col-span-3">
          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">نوع جلسه</label>
          <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 h-9 items-center">
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              className={`py-1 text-xs font-semibold rounded-md transition-all h-7
                ${typeFilter === 'all'
                  ? 'bg-white text-zinc-900 shadow-xs dark:bg-zinc-900 dark:text-zinc-50'
                  : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'}`}
            >
              همه
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('game')}
              className={`py-1 text-xs font-semibold rounded-md transition-all h-7
                ${typeFilter === 'game'
                  ? 'bg-white text-emerald-600 shadow-xs dark:bg-zinc-900 dark:text-emerald-400'
                  : 'text-zinc-500 hover:text-emerald-500 dark:text-zinc-400'}`}
            >
              بازی
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('training')}
              className={`py-1 text-xs font-semibold rounded-md transition-all h-7
                ${typeFilter === 'training'
                  ? 'bg-white text-blue-600 shadow-xs dark:bg-zinc-900 dark:text-blue-400'
                  : 'text-zinc-500 hover:text-blue-500 dark:text-zinc-400'}`}
            >
              تمرین
            </button>
          </div>
        </div>

        {/* Date Ranges */}
        <div className="grid grid-cols-2 gap-2 md:col-span-5 items-end">
          {/* From Date */}
          <div className="space-y-1.5 relative">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">از تاریخ</label>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start text-left font-normal h-9 px-3 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs"
              onClick={() => {
                setShowFromPicker(!showFromPicker)
                setShowToPicker(false)
              }}
            >
              <CalendarIcon className="me-2 h-3.5 w-3.5 text-zinc-400 shrink-0" />
              <span className="">
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
          <div className="space-y-1.5 relative">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">تا تاریخ</label>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start text-left font-normal h-9 px-3 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs"
              onClick={() => {
                setShowToPicker(!showToPicker)
                setShowFromPicker(false)
              }}
            >
              <CalendarIcon className="me-2 h-3.5 w-3.5 text-zinc-400 shrink-0" />
              <span className="">
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
                <div className="fixed inset-0 z-40" onClick={() => setShowToPicker(false)} />
                <div className="absolute top-[100%] start-0 z-50 mt-1 rounded-xl border border-zinc-200/80 bg-white p-3 shadow-lg dark:border-zinc-800/80 dark:bg-zinc-950 animate-slide-up">
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
