'use client'

import { useState } from 'react'
import { Settings2Icon, PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PadelSession, PadelSettings } from './types'
import { calculateStats } from './utils'
import { StatsDashboard } from './components/stats-dashboard'
import { SessionHistory } from './components/session-history'
import { SettingsDialog } from './components/settings-dialog'
import { LogSessionDialog } from './components/log-session-dialog'
import { EditSessionDialog } from './components/edit-session-dialog'
import { DeleteConfirmDialog } from './components/delete-confirm-dialog'

interface PadelClientProps {
  initialSettings: PadelSettings
  initialSessions: PadelSession[]
}

export function PadelClient({ initialSettings, initialSessions }: PadelClientProps) {
  // Modal states
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showLogModal, setShowLogModal] = useState(false)
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  // Active items for edit/delete
  const [sessionIdToDelete, setSessionIdToDelete] = useState<string | null>(null)
  const [sessionToEdit, setSessionToEdit] = useState<PadelSession | null>(null)

  // Calculate stats from sessions
  const stats = calculateStats(initialSessions)

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">مدیریت جلسات</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">جلسات بازی، تمرینات، نرخ‌ها و هزینه‌های زمین خود رو ثبت و ردیابی کن.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowSettingsModal(true)}
            className="h-10 w-10 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            title="نرخ‌های ساعتی پیش‌فرض"
          >
            <Settings2Icon className="h-4.5 w-4.5" />
          </Button>
          <Button
            onClick={() => setShowLogModal(true)}
            className="h-10 font-bold px-4 gap-2 shadow-xs transition-transform active:scale-[0.98]"
          >
            <PlusIcon className="h-4 w-4" />
            ثبت جلسه جدید
          </Button>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <StatsDashboard stats={stats} />

      {/* Session History */}
      <SessionHistory
        sessions={initialSessions}
        onEdit={(session) => {
          setSessionToEdit(session)
          setShowEditModal(true)
        }}
        onDelete={(id) => {
          setSessionIdToDelete(id)
          setShowDeleteConfirmModal(true)
        }}
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
    </div>
  )
}
