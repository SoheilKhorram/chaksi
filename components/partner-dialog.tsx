'use client'

import { useState, useTransition } from 'react'
import {
  CopyIcon,
  CheckIcon,
  UsersIcon,
  UserPlusIcon,
  UserXIcon,
  ClockIcon,
  Loader2Icon,
  CheckCircle2Icon
} from 'lucide-react'
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
import {
  sendPartnerRequestAction,
  acceptPartnerRequestAction,
  declinePartnerRequestAction,
  disconnectPartnerAction
} from '@/app/actions/partner'

interface PartnerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  partner: { id: string; username: string; displayId: string } | null
  receivedRequests: Array<{ id: string; sender: { id: string; username: string; displayId: string } }>
  sentRequests: Array<{ id: string; receiver: { id: string; username: string; displayId: string } }>
}

export function PartnerDialog({
  open,
  onOpenChange,
  userId,
  partner,
  receivedRequests,
  sentRequests
}: PartnerDialogProps) {
  const [partnerIdInput, setPartnerIdInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSendPending, startSendTransition] = useTransition()
  const [isActionPending, startActionTransition] = useTransition()
  const isAnyPending = isSendPending || isActionPending

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(userId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy ID:', err)
    }
  }

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const targetId = partnerIdInput.trim()
    if (!targetId) {
      setError('لطفا کد هم‌تیمی را وارد کنید.')
      return
    }

    if (!/^[A-Za-z0-9]{6}$/.test(targetId)) {
      setError('کد هم‌تیمی باید یک شناسه ۶ کاراکتری شامل حروف و اعداد باشد.')
      return
    }

    startSendTransition(async () => {
      const res = await sendPartnerRequestAction(targetId)
      if (res.success) {
        setPartnerIdInput('')
        setSuccess('درخواست هم‌تیمی با موفقیت ارسال شد!')
      } else {
        setError(res.error || 'ارسال درخواست ناموفق بود.')
      }
    })
  }

  const handleAcceptRequest = (requestId: string) => {
    setError(null)
    setSuccess(null)
    startActionTransition(async () => {
      const res = await acceptPartnerRequestAction(requestId)
      if (res.success) {
        setSuccess('هم‌تیمی شما متصل شد!')
      } else {
        setError(res.error || 'تایید درخواست ناموفق بود.')
      }
    })
  }

  const handleDeclineRequest = (requestId: string) => {
    setError(null)
    setSuccess(null)
    startActionTransition(async () => {
      const res = await declinePartnerRequestAction(requestId)
      if (res.success) {
        setSuccess('درخواست با موفقیت حذف شد.')
      } else {
        setError(res.error || 'رد درخواست ناموفق بود.')
      }
    })
  }

  const handleDisconnect = () => {
    setError(null)
    setSuccess(null)
    if (!confirm('آیا مطمئن هستید که می‌خواهید ارتباط خود با هم‌تیمی فعلی را قطع کنید؟')) {
      return
    }

    startActionTransition(async () => {
      const res = await disconnectPartnerAction()
      if (res.success) {
        setSuccess('ارتباط با هم‌تیمی قطع شد.')
      } else {
        setError(res.error || 'قطع ارتباط ناموفق بود.')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
            <UsersIcon className="h-5 w-5 text-primary" />
            <span>مدیریت هم‌تیمی</span>
          </DialogTitle>
          <DialogDescription>
            کد خودت یا دوستت رو وارد کن تا جلسات مشترکتون هماهنگ بشه
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-xs font-semibold text-destructive dark:text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {success}
            </div>
          )}

          {/* User's own ID section */}
          <div className="space-y-1.5 rounded-lg border border-zinc-200 bg-zinc-50 p-3.5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <Label className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">کد کاربری شما جهت اشتراک‌گذاری</Label>
            <div className="flex gap-2">
              <code className="flex-1 select-all break-all rounded border border-zinc-200 bg-white px-2.5 py-1 text-center text-xs font-mono tracking-wider text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 flex items-center justify-center">
                {userId}
              </code>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopyId}
                className="h-9 w-9 shrink-0 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                title="کپی کردن کد"
              >
                {copied ? <CheckIcon className="h-4 w-4 text-emerald-600" /> : <CopyIcon className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Active Partner section */}
          {partner ? (
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-right flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1">
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5 justify-start">
                  <CheckCircle2Icon className="h-4 w-4 animate-pulse" />
                  هم‌تیمی متصل شده
                </span>
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{partner.username}</p>
                <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 tracking-tight">{partner.displayId}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                disabled={isAnyPending}
                className="h-8 shrink-0 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive flex items-center gap-1"
              >
                <UserXIcon className="h-3.5 w-3.5" />
                قطع ارتباط
              </Button>
            </div>
          ) : (
            /* Connect to a new partner input */
            <form onSubmit={handleSendRequest} className="space-y-2">
              <Label htmlFor="partner-id-input" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">اتصال به هم‌تیمی جدید</Label>
              <div className="flex gap-2">
                <Input
                  id="partner-id-input"
                  type="text"
                  placeholder="کد کاربری هم‌تیمی رو وارد کن..."
                  value={partnerIdInput}
                  onChange={(e) => setPartnerIdInput(e.target.value)}
                  disabled={isAnyPending}
                  className="h-9 text-xs"
                />
                <Button
                  type="submit"
                  disabled={isAnyPending || !partnerIdInput.trim()}
                  className="h-9 shrink-0 px-3.5 text-xs font-semibold flex items-center gap-1"
                >
                  {isSendPending ? (
                    <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <UserPlusIcon className="h-3.5 w-3.5" />
                  )}
                  ارسال
                </Button>
              </div>
            </form>
          )}

          {/* Received Requests */}
          {receivedRequests.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <ClockIcon className="h-3.5 w-3.5 text-amber-500" />
                <span>درخواست‌های دریافتی</span>
              </h3>
              <div className="space-y-1.5">
                {receivedRequests.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-zinc-200 bg-zinc-50/50 p-2.5 dark:border-zinc-800 dark:bg-zinc-900/30 text-xs"
                  >
                    <div>
                      <p className="font-bold text-zinc-800 dark:text-zinc-200">{req.sender.username}</p>
                      <p className="text-[10px] text-zinc-400 font-mono tracking-tight">{req.sender.displayId}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptRequest(req.id)}
                        disabled={isAnyPending}
                        className="h-7 px-3 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        قبول
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeclineRequest(req.id)}
                        disabled={isAnyPending}
                        className="h-7 px-2 text-[11px] text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
                      >
                        رد کردن
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sent Requests */}
          {sentRequests.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <ClockIcon className="h-3.5 w-3.5 text-zinc-400" />
                <span>درخواست‌های ارسالی شما</span>
              </h3>
              <div className="space-y-1.5">
                {sentRequests.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-zinc-150 dark:bg-zinc-900/30 p-2 px-2.5 text-xs  dark:border-zinc-800"
                  >
                    <div className="grid">
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">درخواست به {req.receiver.username}</span>
                      <span className="text-[9px] text-zinc-400 font-mono tracking-tight">{req.receiver.displayId}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeclineRequest(req.id)}
                      disabled={isAnyPending}
                      className="h-7 px-2 text-[10px] text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                    >
                      لغو درخواست
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
