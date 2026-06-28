import { TrophyIcon } from 'lucide-react'
import { PadelSession } from '../types'
import { SessionCard } from './session-card'

interface SessionHistoryProps {
  sessions: PadelSession[]
  onEdit: (session: PadelSession) => void
  onDelete: (id: string) => void
  onTogglePaid: (id: string) => void
  isPending?: boolean
}

export function SessionHistory({ sessions, onEdit, onDelete, onTogglePaid, isPending = false }: SessionHistoryProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">تاریخچه جلسات</h2>
        <span className="text-xs font-medium bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-full dark:bg-zinc-800 dark:text-zinc-300">
          در مجموع {sessions.length.toLocaleString('fa-IR')} مورد
        </span>
      </div>

      {sessions.length === 0 ? (
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
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onEdit={onEdit}
              onDelete={onDelete}
              onTogglePaid={onTogglePaid}
              isPending={isPending}
            />
          ))}
        </div>
      )}
    </div>
  )
}
