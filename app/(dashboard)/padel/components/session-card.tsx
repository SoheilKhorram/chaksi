import { ClockIcon, UsersIcon, ShoppingBagIcon, CalendarIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PadelSession } from '../types'
import { formatPrice } from '../utils'

interface SessionCardProps {
  session: PadelSession
  onEdit: (session: PadelSession) => void
  onDelete: (id: string) => void
  onTogglePaid: (id: string) => void
  isPending?: boolean
}

export function SessionCard({ session, onEdit, onDelete, onTogglePaid, isPending = false }: SessionCardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md dark:bg-zinc-900/40 dark:hover:bg-zinc-900/60
          ${session.type === 'game'
          ? 'border-l-4 border-l-emerald-500 border-zinc-200/80 dark:border-zinc-800/80 dark:border-l-emerald-500/60 '
          : 'border-l-4 border-l-blue-500 border-zinc-200/80 dark:border-zinc-800/80 dark:border-l-blue-500/60'}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Info Side */}
        <div className="space-y-2.75">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2.25 py-1.5 text-xs font-semibold
                ${session.type === 'game'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                : 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'}`}
            >
              {session.type === 'game' ? 'بازی / مسابقه' : 'تمرین'}
            </span>

            {/* Payment Status Badge */}
            <button
              onClick={() => onTogglePaid(session.id)}
              disabled={isPending}
              title="برای تغییر وضعیت پرداخت کلیک کنید"
              className={`inline-flex items-center rounded-full px-2.25 py-1.5 text-xs font-semibold cursor-pointer border select-none transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50
                ${session.isPaid
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-800/40 hover:bg-emerald-100 dark:hover:bg-emerald-500/20'
                  : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-800/40 hover:bg-amber-100 dark:hover:bg-amber-500/20'}`}
            >
              {session.isPaid ? 'تسویه شده' : 'تسویه نشده'}
            </button>

            <span className="text-xs text-zinc-400 dark:text-zinc-500">•</span>
            <span className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
              <CalendarIcon className="h-3 w-3" />
              {new Date(session.date).toLocaleDateString('fa-IR', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-zinc-800 dark:text-zinc-200 font-semibold">
              <ClockIcon className="h-3.5 w-3.5 text-zinc-400" />
              {session.duration.toLocaleString('fa-IR')} ساعت
            </div>
            {session.players && (
              <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                <UsersIcon className="h-4 w-4 text-zinc-400" />
                <span className="truncate max-w-[200px]" title={session.players}>{session.players}</span>
              </div>
            )}
            {session.extraItems.length > 0 && (
              <div
                className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300"
              >
                <ShoppingBagIcon className="h-3 w-3 text-zinc-400" />
              </div>
            )}
          </div>
        </div>

        {/* Cost & Action Side */}
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:text-right shrink-0">
          <div>
            <div className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              {formatPrice(session.totalCost)}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-primary dark:hover:bg-primary/10 hover:bg-primary/5"
              onClick={() => onEdit(session)}
              disabled={isPending}
            >
              <PencilIcon className="h-4.5 w-4.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-red-500 dark:hover:bg-red-500/10 hover:bg-red-50"
              onClick={() => onDelete(session.id)}
              disabled={isPending}
            >
              <Trash2Icon className="h-4.5 w-4.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
