import { CalendarIcon, PlusIcon, Trash2Icon, Loader2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useEditSessionForm } from '../hooks/use-edit-session-form'
import { PadelSession, PadelSettings } from '../types'
import { formatPrice } from '../utils'

interface EditSessionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: PadelSession
  settings: PadelSettings
}

export function EditSessionDialog({ open, onOpenChange, session, settings }: EditSessionDialogProps) {
  const {
    selectedDate,
    setSelectedDate,
    showDatePicker,
    setShowDatePicker,
    duration,
    setDuration,
    players,
    setPlayers,
    type,
    setType,
    isCustomPrice,
    setIsCustomPrice,
    customPrice,
    setCustomPrice,
    extraItems,
    error,
    success,
    calculatedPreviewPrice,
    calculatedExtraCostPreview,
    calculatedTotalPreview,
    addExtraItemRow,
    removeExtraItemRow,
    updateExtraItem,
    onSubmit,
    isPending
  } = useEditSessionForm(session, settings, () => onOpenChange(false))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ویرایش جلسه</DialogTitle>
          <DialogDescription className="sr-only">
            ویرایش اطلاعات مربوط به جلسه بازی یا تمرین پدل ثبت شده
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg bg-emerald-50 p-3 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            تغییرات با موفقیت ذخیره شد!
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Type Switcher */}
          <div className="space-y-1.5">
            <Label>نوع جلسه</Label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <button
                type="button"
                onClick={() => setType('game')}
                className={`py-1.5 text-xs font-semibold rounded-md transition-all
                  ${type === 'game'
                    ? 'bg-white text-emerald-600 shadow-sm dark:bg-zinc-900 dark:text-emerald-400'
                    : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'}`}
              >
                بازی / مسابقه
              </button>
              <button
                type="button"
                onClick={() => setType('training')}
                className={`py-1.5 text-xs font-semibold rounded-md transition-all
                  ${type === 'training'
                    ? 'bg-white text-blue-600 shadow-sm dark:bg-zinc-900 dark:text-blue-400'
                    : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400'}`}
              >
                تمرین
              </button>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-date">تاریخ</Label>
            <div className="relative">
              <Button
                id="edit-date"
                type="button"
                variant="outline"
                className="w-full justify-start text-left font-normal h-9 px-3 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
                onClick={() => setShowDatePicker(!showDatePicker)}
              >
                <CalendarIcon className="me-2 h-4 w-4 text-zinc-400" />
                {selectedDate ? (
                  selectedDate.toLocaleDateString('fa-IR', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })
                ) : (
                  <span className="text-zinc-400">انتخاب تاریخ</span>
                )}
              </Button>

              {showDatePicker && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowDatePicker(false)}
                  />
                  <div className="absolute top-[100%] start-0 z-50 mt-1 rounded-xl border border-zinc-200/80 bg-white p-3 shadow-lg dark:border-zinc-800/80 dark:bg-zinc-950 animate-slide-up">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(day) => {
                        setSelectedDate(day)
                        setShowDatePicker(false)
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Duration with Preset Buttons */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-duration">مدت زمان (ساعت)</Label>
            <div className="flex gap-2">
              <Input
                id="edit-duration"
                type="number"
                min="0.1"
                max="12"
                step="0.1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
                className="h-9"
              />
              {['1.0', '1.5', '2.0'].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setDuration(val)}
                  className={`px-3 text-xs font-medium border border-zinc-200 rounded-lg hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800 transition-colors
                    ${duration === val ? 'bg-zinc-100 border-zinc-300 dark:bg-zinc-800 dark:border-zinc-700' : ''}`}
                >
                  {parseFloat(val).toLocaleString('fa-IR')} ساعت
                </button>
              ))}
            </div>
          </div>

          {/* Who did you play with */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-players">هم‌بازی‌ها</Label>
            <Input
              id="edit-players"
              type="text"
              value={players}
              onChange={(e) => setPlayers(e.target.value)}
              placeholder="مثال: علی، رضا، سارا"
              className="h-9"
            />
          </div>

          {/* Price Customization Toggle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-custom-price-toggle" className="cursor-pointer">قیمت‌گذاری سفارشی</Label>
              <Checkbox
                id="edit-custom-price-toggle"
                checked={isCustomPrice}
                onCheckedChange={(checked) => setIsCustomPrice(!!checked)}
              />
            </div>
            {isCustomPrice && (
              <div className="space-y-1.5 animate-slide-up">
                <Input
                  id="editCustomPrice"
                  type="text"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder="هزینه کل جلسه را وارد کنید"
                  required={isCustomPrice}
                  className="h-9"
                />
              </div>
            )}
          </div>

          {/* Extra Items List */}
          <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">خرید اقلام جانبی</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs gap-1 border-dashed"
                onClick={addExtraItemRow}
              >
                <PlusIcon className="h-3 w-3" /> افزودن آیتم
              </Button>
            </div>

            {extraItems.length > 0 && (
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {extraItems.map((item, index) => (
                  <div key={index} className="flex gap-2 items-center animate-slide-up">
                    <Input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateExtraItem(index, 'name', e.target.value)}
                      placeholder="مثال: گریپ، آب، توپ"
                      required
                      className="h-8 text-xs flex-1"
                    />
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={item.price}
                      onChange={(e) => updateExtraItem(index, 'price', e.target.value)}
                      placeholder="۰"
                      required
                      className="h-8 text-xs w-20"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-zinc-400 hover:text-red-500"
                      onClick={() => removeExtraItemRow(index)}
                    >
                      <Trash2Icon className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Price Preview Block */}
          <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-4 dark:bg-zinc-900/40 dark:border-zinc-800/80 text-xs space-y-2">
            <div className="flex justify-between text-zinc-500">
              <span>هزینه جلسه:</span>
              <span>{formatPrice(calculatedPreviewPrice)}</span>
            </div>
            {extraItems.length > 0 && (
              <div className="flex justify-between text-zinc-500">
                <span>اقلام جانبی:</span>
                <span>{formatPrice(calculatedExtraCostPreview)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-zinc-900 dark:text-zinc-50 border-t border-zinc-200/50 dark:border-zinc-800/50 pt-2 text-sm">
              <span>مجموع کل تقریبی:</span>
              <span>{formatPrice(calculatedTotalPreview)}</span>
            </div>
          </div>

          {/* Submit Session */}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full font-bold h-10 shadow-sm shadow-primary/10 transition-transform active:scale-[0.98]"
          >
            {isPending ? (
              <>
                <Loader2Icon className="me-2 h-4 w-4 animate-spin" /> در حال ذخیره...
              </>
            ) : (
              'ذخیره تغییرات'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
