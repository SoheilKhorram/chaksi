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

interface LogoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isPending?: boolean
}

export function LogoutDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending = false,
}: LogoutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs sm:max-w-sm" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle className="text-zinc-900 dark:text-zinc-50">
            خروج از حساب کاربری
          </DialogTitle>
          <DialogDescription>
            آیا برای خروج از حساب کاربری خود مطمئن هستید؟
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
            {isPending ? "در حال خروج..." : "خروج از حساب"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
