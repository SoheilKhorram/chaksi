import { Settings2Icon, CheckIcon, Loader2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useSettingsForm } from '../hooks/use-settings-form'
import { PadelSettings } from '../types'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialSettings: PadelSettings
}

export function SettingsDialog({ open, onOpenChange, initialSettings }: SettingsDialogProps) {
  const {
    gamePrice,
    setGamePrice,
    trainingPrice,
    setTrainingPrice,
    error,
    success,
    isPending,
    onSubmit
  } = useSettingsForm(initialSettings, () => onOpenChange(false))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2Icon className="h-5 w-5 text-primary" />
            <span>نرخ‌های ساعتی پیش‌فرض</span>
          </DialogTitle>
          <DialogDescription className="sr-only">
            تنظیم نرخ‌های ساعتی پیش‌فرض برای بازی و تمرین پدل
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="modal-gamePrice">نرخ بازی (تومان/ساعت)</Label>
              <Input
                id="modal-gamePrice"
                type="number"
                min="0"
                step="1"
                value={gamePrice}
                onChange={(e) => setGamePrice(e.target.value)}
                placeholder="مثال: ۱۰۰۰۰۰"
                required
                className="h-9 bg-zinc-50 dark:bg-zinc-900"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="modal-trainingPrice">نرخ تمرین (تومان/ساعت)</Label>
              <Input
                id="modal-trainingPrice"
                type="number"
                min="0"
                step="1"
                value={trainingPrice}
                onChange={(e) => setTrainingPrice(e.target.value)}
                placeholder="مثال: ۱۵۰۰۰۰"
                required
                className="h-9 bg-zinc-50 dark:bg-zinc-900"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9 text-xs"
            >
              انصراف
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="h-9 text-xs font-semibold px-4"
            >
              {isPending && <Loader2Icon className="me-1.5 h-3.5 w-3.5 animate-spin" />}
              ذخیره نرخ‌ها
            </Button>
          </div>

          {success && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-semibold justify-end animate-fade-in mt-2">
              <CheckIcon className="h-4 w-4" /> ذخیره شد!
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
