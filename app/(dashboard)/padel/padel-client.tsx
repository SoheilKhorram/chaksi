'use client'

import { useState, useTransition } from 'react'
import { Settings2Icon, PlusIcon, WalletIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PadelSession, PadelSettings, SharedSession } from './types'
import { calculateStats, toLocalDateString } from './utils'

import { StatsDashboard } from './components/stats-dashboard'
import { SessionHistory } from './components/session-history'
import { SettingsDialog } from './components/settings-dialog'
import { LogSessionDialog } from './components/log-session-dialog'
import { EditSessionDialog } from './components/edit-session-dialog'
import { DeleteConfirmDialog } from './components/delete-confirm-dialog'
import { SessionFilters } from './components/session-filters'
import { SharedSessionsList } from './components/shared-sessions-list'
import { BulkSettleDialog } from './components/bulk-settle-dialog'

import { togglePadelSessionPaidAction } from '@/app/actions/padel'

interface PadelClientProps {
  initialSettings: PadelSettings
  initialSessions: PadelSession[]
  partner: { id: string; username: string } | null
  initialSharedSessions: SharedSession[]
}

export function PadelClient({
  initialSettings,
  initialSessions,
  partner,
  initialSharedSessions
}: PadelClientProps) {
  // Modal states
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showLogModal, setShowLogModal] = useState(false)
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showBulkSettleModal, setShowBulkSettleModal] = useState(false)

  // Active items for edit/delete
  const [sessionIdToDelete, setSessionIdToDelete] = useState<string | null>(null)
  const [sessionToEdit, setSessionToEdit] = useState<PadelSession | null>(null)

  // Filter states
  const [playersFilter, setPlayersFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'game' | 'training'>('all')
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('unpaid')
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined)
  const [toDate, setToDate] = useState<Date | undefined>(undefined)

  const [isPending, startTransition] = useTransition()

  const handleTogglePaid = (sessionId: string) => {
    startTransition(async () => {
      await togglePadelSessionPaidAction(sessionId)
    })
  }

  const handleClearFilters = () => {
    setPlayersFilter('')
    setTypeFilter('all')
    setPaymentFilter('all')
    setFromDate(undefined)
    setToDate(undefined)
  }

  const hasActiveFilters =
    playersFilter !== '' ||
    typeFilter !== 'all' ||
    paymentFilter !== 'all' ||
    fromDate !== undefined ||
    toDate !== undefined

  // Filtered sessions
  const filteredSessions = initialSessions.filter((session) => {
    // 1. Filter by players
    if (playersFilter.trim() !== '') {
      if (!session.players.toLowerCase().includes(playersFilter.toLowerCase())) {
        return false
      }
    }

    // 2. Filter by type
    if (typeFilter !== 'all') {
      if (session.type !== typeFilter) {
        return false
      }
    }

    // 2.5 Filter by payment status
    if (paymentFilter !== 'all') {
      const wantPaid = paymentFilter === 'paid'
      if (session.isPaid !== wantPaid) {
        return false
      }
    }

    // 3. Filter by date range
    const sessionDateStr = session.date.split('T')[0]
    if (fromDate) {
      const fromDateStr = toLocalDateString(fromDate)
      if (sessionDateStr < fromDateStr) return false
    }
    if (toDate) {
      const toDateStr = toLocalDateString(toDate)
      if (sessionDateStr > toDateStr) return false
    }


    return true
  })

  // Calculate stats from filtered sessions
  const stats = calculateStats(filteredSessions)

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1 text-right">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">مدیریت جلسات</h1>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">مدیریت بازی‌ها، تمرین‌ها و هزینه‌های زمین</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={() => setShowLogModal(true)}
            className="h-10 font-bold px-4 gap-2 shadow-xs transition-transform active:scale-[0.98]"
          >
            <PlusIcon className="h-4 w-4" />
            جلسه جدید
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowBulkSettleModal(true)}
            className="h-10 font-bold px-4 gap-2 border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/10 transition-transform active:scale-[0.98]"
          >
            <WalletIcon className="h-4 w-4" />
            تسویه حساب
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowSettingsModal(true)}
            className="h-10 w-10 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            title="نرخ‌های ساعتی پیش‌فرض"
          >
            <Settings2Icon className="h-4.5 w-4.5" />
          </Button>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <StatsDashboard stats={stats} />

      {/* Shared Sessions List */}
      <SharedSessionsList sharedSessions={initialSharedSessions} />

      {/* Session Filters */}
      <SessionFilters
        playersFilter={playersFilter}
        setPlayersFilter={setPlayersFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        paymentFilter={paymentFilter}
        setPaymentFilter={setPaymentFilter}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        onClear={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Session History */}
      <SessionHistory
        sessions={filteredSessions}
        onEdit={(session) => {
          setSessionToEdit(session)
          setShowEditModal(true)
        }}
        onDelete={(id) => {
          setSessionIdToDelete(id)
          setShowDeleteConfirmModal(true)
        }}
        onTogglePaid={handleTogglePaid}
        isPending={isPending}
      />

      {/* Settings Modal */}
      <SettingsDialog
        open={showSettingsModal}
        onOpenChange={setShowSettingsModal}
        initialSettings={initialSettings}
      />

      {/* Log Session Modal */}
      <LogSessionDialog
        open={showLogModal}
        onOpenChange={setShowLogModal}
        settings={initialSettings}
        partner={partner}
      />

      {/* Edit Session Modal */}
      {showEditModal && sessionToEdit && (
        <EditSessionDialog
          open={showEditModal}
          onOpenChange={(open) => {
            setShowEditModal(open)
            if (!open) setSessionToEdit(null)
          }}
          session={sessionToEdit}
          settings={initialSettings}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmDialog
        open={showDeleteConfirmModal}
        onOpenChange={(open) => {
          setShowDeleteConfirmModal(open)
          if (!open) setSessionIdToDelete(null)
        }}
        sessionId={sessionIdToDelete}
        onSuccess={() => {
          setShowDeleteConfirmModal(false)
          setSessionIdToDelete(null)
        }}
      />

      {/* Bulk Settle Modal */}
      <BulkSettleDialog
        open={showBulkSettleModal}
        onOpenChange={setShowBulkSettleModal}
        sessions={initialSessions}
      />
    </div>
  )
}
