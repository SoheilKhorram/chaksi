import { TrophyIcon, ClockIcon, DollarSignIcon, ActivityIcon } from 'lucide-react'
import { formatPrice } from '../utils'

interface StatsDashboardProps {
  stats: {
    totalDuration: number
    totalCost: number
    extraCost: number
    gameCount: number
    trainingCount: number
    sessionCount: number
  }
}

export function StatsDashboard({ stats }: StatsDashboardProps) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {/* Metric 1: Total Cost */}
      <div className="relative overflow-hidden rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-900/50 backdrop-blur-md">
        <div className="absolute top-0 left-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-primary/10 blur-xl"></div>
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
        <div className="absolute top-0 left-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-emerald-500/10 blur-xl"></div>
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
        <div className="absolute top-0 left-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-amber-500/10 blur-xl"></div>
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
        <div className="absolute top-0 left-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-blue-500/10 blur-xl"></div>
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
  )
}
