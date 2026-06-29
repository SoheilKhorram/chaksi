import { useTransition } from 'react'
import { AlertTriangleIcon, Loader2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle
} from '@/components/ui/dialog'
import { deletePadelSessionAction } from '@/app/actions/padel'

interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sessionId: string | null
  onSuccess: () => void
}

export function DeleteConfirmDialog({ open, onOpenChange, sessionId, onSuccess }: DeleteConfirmDialogProps) {
  const [isPending, startTransition] = useTransition()

  const handleConfirmDelete = () => {
    if (!sessionId) return
    startTransition(async () => {
      const res = await deletePadelSessionAction(sessionId)
      if (res.success) {
        onSuccess()
      }
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(openVal) => {
        if (!openVal && !isPending) {
          onOpenChange(false)
        }
      }}
    >
      <DialogContent className="max-w-sm" showCloseButton={!isPending}>
        <div className="flex flex-col items-center text-center space-y-4 pt-4">
          <div className="rounded-full bg-red-50 p-3 text-red-500 dark:bg-red-500/10">
            <AlertTriangleIcon className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <DialogTitle className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50 text-center">
              حذف جلسه
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
              آیا از حذف این جلسه مطمئن هستید؟
            </DialogDescription>
          </div>
        </div>

        <DialogFooter className="flex items-center flex-row justify-end gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-800 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="h-9 text-xs"
          >
            انصراف
          </Button>
          <Button
            type="button"
            onClick={handleConfirmDelete}
            disabled={isPending}
            variant="destructive"
            className="h-9 text-xs font-semibold px-4 bg-red-600 hover:bg-red-700 text-white"
          >
            {isPending && <Loader2Icon className="me-1.5 h-3.5 w-3.5 animate-spin" />}
            حذف جلسه
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
