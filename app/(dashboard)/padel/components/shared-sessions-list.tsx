'use client'

import { useState, useTransition } from 'react'
import {
  ClockIcon,
  UsersIcon,
  ShoppingBagIcon,
  CalendarIcon,
  CheckIcon,
  XIcon,
  Loader2Icon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SharedSession } from '../types'
import { formatPrice } from '../utils'
import { acceptSharedSessionAction, declineSharedSessionAction } from '@/app/actions/padel'

interface SharedSessionsListProps {
  sharedSessions: SharedSession[]
}

export function SharedSessionsList({ sharedSessions }: SharedSessionsListProps) {
  const [isPending, startTransition] = useTransition()
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [activeAction, setActiveAction] = useState<'accept' | 'decline' | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (sharedSessions.length === 0) return null

  const handleAction = (id: string, action: 'accept' | 'decline') => {
    if (isPending) return
    setError(null)
    setActiveSessionId(id)
    setActiveAction(action)

    startTransition(async () => {
      let res
      if (action === 'accept') {
        res = await acceptSharedSessionAction(id)
      } else {
        res = await declineSharedSessionAction(id)
      }

      if (!res.success) {
        setError(res.error || 'عملیات با خطا مواجه شد.')
        setActiveSessionId(null)
        setActiveAction(null)
      } else {
        // Success will automatically cause Next.js router refresh and update the prop list
        setActiveSessionId(null)
        setActiveAction(null)
      }
    })
  }

  return (
    <div className="space-y-4 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 p-5 dark:border-zinc-800 dark:bg-zinc-900/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            جلسات دریافتی از هم‌تیمی
          </h2>
          <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            {sharedSessions.length.toLocaleString('fa-IR')} مورد جدید
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
        {sharedSessions.map((session) => {
          const isCurrentPending = isPending && activeSessionId === session.id
          const totalCost = session.price + session.extraItems.reduce((sum, item) => sum + item.price, 0)

          return (
            <div
              key={session.id}
              className={`group relative overflow-hidden rounded-xl border bg-white p-4 shadow-xs transition-all dark:bg-zinc-900/40
                ${session.type === 'game'
                  ? 'border-l-4 border-l-emerald-500 border-zinc-200/80 dark:border-zinc-800/80 dark:border-l-emerald-500/60'
                  : 'border-l-4 border-l-blue-500 border-zinc-200/80 dark:border-zinc-800/80 dark:border-l-blue-500/60'}`}
            >
              <div className="flex flex-col gap-3">
                {/* Details Row */}
                <div className="space-y-1.5 text-right">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold
                        ${session.type === 'game'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                          : 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'}`}
                      >
                        {session.type === 'game' ? 'بازی / مسابقه' : 'تمرین'}
                      </span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500">•</span>
                      <span className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                        <CalendarIcon className="h-3 w-3" />
                        {new Date(session.date).toLocaleDateString('fa-IR', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-zinc-400">
                      از طرف: {session.senderName}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                    <div className="flex items-center gap-1 text-zinc-800 dark:text-zinc-200 font-semibold">
                      <ClockIcon className="h-3.5 w-3.5 text-zinc-400" />
                      {session.duration.toLocaleString('fa-IR')} ساعت
                    </div>
                    {session.players && (
                      <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300">
                        <UsersIcon className="h-3.5 w-3.5 text-zinc-400" />
                        <span className="truncate max-w-[140px]" title={session.players}>{session.players}</span>
                      </div>
                    )}
                    {session.extraItems.length > 0 && (
                      <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300">
                        <ShoppingBagIcon className="h-3.5 w-3.5 text-zinc-400" />
                        <span className="text-[10px] bg-zinc-100 px-1.5 py-0.5 rounded-full dark:bg-zinc-800 text-zinc-500">
                          {session.extraItems.length.toLocaleString('fa-IR')} آیتم
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pricing & Actions Row */}
                <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                  <div className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                    {formatPrice(totalCost)}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAction(session.id, 'decline')}
                      disabled={isPending}
                      className="h-8 px-2 text-xs text-zinc-500 hover:text-red-500 dark:hover:bg-red-500/10 hover:bg-red-50 gap-1 rounded-lg"
                    >
                      {isCurrentPending && activeAction === 'decline' ? (
                        <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <XIcon className="h-3.5 w-3.5" />
                      )}
                      رد کردن
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction(session.id, 'accept')}
                      disabled={isPending}
                      className="h-8 px-2.5 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:text-emerald-400 dark:border-emerald-900/30 dark:hover:bg-emerald-950/20 gap-1 font-semibold rounded-lg"
                    >
                      {isCurrentPending && activeAction === 'accept' ? (
                        <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckIcon className="h-3.5 w-3.5" />
                      )}
                      افزودن به جلسات من
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
