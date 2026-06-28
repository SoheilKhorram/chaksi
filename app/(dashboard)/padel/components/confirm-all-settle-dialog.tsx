import { HelpCircleIcon, Loader2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog'

interface ConfirmAllSettleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  totalUnpaidSessionsCount: number
  onConfirm: () => void
  isPending: boolean
}

export function ConfirmAllSettleDialog({
  open,
  onOpenChange,
  totalUnpaidSessionsCount,
  onConfirm,
  isPending,
}: ConfirmAllSettleDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(openVal) => {
        if (!openVal && !isPending) {
          onOpenChange(false)
        }
      }}
    >
      <DialogContent className="max-w-md" showCloseButton={!isPending}>
        <div className="flex flex-col items-center text-center space-y-4 pt-4">
          <div className="rounded-full bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            <HelpCircleIcon className="h-6 w-6" />
          </div>
          <div className="space-y-2 w-full">
            <DialogTitle className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50 text-center">
              تایید تسویه تمامی جلسات
            </DialogTitle>
            <div className="text-sm text-zinc-500 dark:text-zinc-400 text-center space-y-3">
              <p>
                آیا از تسویه تمامی {totalUnpaidSessionsCount.toLocaleString('fa-IR')} جلسه پرداخت‌نشده تا کنون اطمینان دارید؟
              </p>
              <div className="mt-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60 p-4 space-y-2 text-xs text-start">
                <div className="flex justify-between">
                  <span className="text-zinc-500">تعداد کل جلسات بدهی:</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {totalUnpaidSessionsCount.toLocaleString('fa-IR')} جلسه
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-end gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-800 mt-2">
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
            onClick={onConfirm}
            disabled={isPending}
            className="h-9 text-xs font-semibold px-4 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isPending && <Loader2Icon className="me-1.5 h-3.5 w-3.5 animate-spin" />}
            بله، تسویه کل
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
