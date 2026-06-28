"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DisconnectPartnerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isPending?: boolean
}

export function DisconnectPartnerDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending = false,
}: DisconnectPartnerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs sm:max-w-sm" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle className="text-zinc-900 dark:text-zinc-50">
            قطع ارتباط با هم‌تیمی
          </DialogTitle>
          <DialogDescription>
            آیا از قطع ارتباط با هم‌تیمی خود مطمئن هستید؟ با این کار دیگر قادر به هماهنگی جلسات مشترک نخواهید بود.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-end gap-2 mt-4">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="text-xs"
          >
            انصراف
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
            className="text-xs"
          >
            {isPending ? "در حال قطع ارتباط..." : "قطع ارتباط"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
