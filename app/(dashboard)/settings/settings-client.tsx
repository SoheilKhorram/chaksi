"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  Eye,
  EyeOff,
  SaveIcon,
  UserIcon,
  Share2 as Share2Icon,
  Camera,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { updateUserSettingsAction, updateAvatarAction, updateSharingSettingsAction } from "@/app/actions/user"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface SettingsClientProps {
  user: {
    username: string
    avatar: string
  }
  padelSettings: {
    sendGameToPartner: boolean
    sendTrainingToPartner: boolean
  }
}

const AVATARS = [
  { file: "cat.png", name: "گربه" },
  { file: "duck.png", name: "اردک" },
  { file: "elephant.png", name: "فیل" },
  { file: "fox.png", name: "روباه" },
  { file: "frog-.png", name: "قورباغه" },
  { file: "gorilla.png", name: "گوریل" },
  { file: "hen.png", name: "مرغ" },
  { file: "hippopotamus.png", name: "اسب آبی" },
  { file: "horse.png", name: "اسب" },
  { file: "penguin.png", name: "پنگوئن" },
  { file: "rabbit.png", name: "خرگوش" },
  { file: "shark.png", name: "کوسه" },
]

export function SettingsClient({ user, padelSettings }: SettingsClientProps) {
  const router = useRouter()
  const [selectedAvatar, setSelectedAvatar] = useState<string>(user.avatar)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [sendGameToPartner, setSendGameToPartner] = useState(padelSettings.sendGameToPartner)
  const [sendTrainingToPartner, setSendTrainingToPartner] = useState(padelSettings.sendTrainingToPartner)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Immediate autosave states
  const [isSavingAvatar, setIsSavingAvatar] = useState(false)
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false)
  const [sharingSaveStatus, setSharingSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  async function handleSharingChange(type: 'game' | 'training', checked: boolean) {
    setSharingSaveStatus('saving')
    
    const newSendGame = type === 'game' ? checked : sendGameToPartner
    const newSendTraining = type === 'training' ? checked : sendTrainingToPartner
    
    if (type === 'game') setSendGameToPartner(checked)
    if (type === 'training') setSendTrainingToPartner(checked)
    
    try {
      const res = await updateSharingSettingsAction(newSendGame, newSendTraining)
      if (res.success) {
        setSharingSaveStatus('saved')
        setTimeout(() => setSharingSaveStatus('idle'), 2500)
      } else {
        setSharingSaveStatus('error')
        // Rollback on failure
        if (type === 'game') setSendGameToPartner(!checked)
        if (type === 'training') setSendTrainingToPartner(!checked)
      }
    } catch (error) {
      setSharingSaveStatus('error')
      // Rollback on failure
      if (type === 'game') setSendGameToPartner(!checked)
      if (type === 'training') setSendTrainingToPartner(!checked)
    }
  }

  async function handleAvatarSelect(avatarFile: string) {
    setIsSavingAvatar(true)
    setError(null)
    try {
      const res = await updateAvatarAction(avatarFile)
      if (res.success) {
        setSelectedAvatar(avatarFile)
        setIsAvatarDialogOpen(false)
        router.refresh()
      } else {
        setError(res.error || "خطایی در تغییر آواتار رخ داد.")
      }
    } catch (error) {
      setError("خطایی در ارتباط با سرور رخ داد.")
    } finally {
      setIsSavingAvatar(false)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData(event.currentTarget)
    // Append the selected avatar (still required by action)
    formData.set("avatar", selectedAvatar)

    try {
      const res = await updateUserSettingsAction(formData)
      if (res.success) {
        setSuccess("تغییرات با موفقیت ذخیره شد!")
        router.refresh()
        // Reset password fields in form
        const passwordInput = document.getElementById("password") as HTMLInputElement
        const confirmPasswordInput = document.getElementById("confirm-password") as HTMLInputElement
        if (passwordInput) passwordInput.value = ""
        if (confirmPasswordInput) confirmPasswordInput.value = ""
      } else {
        setError(res.error || "خطایی در ثبت تغییرات رخ داد.")
      }
    } catch (err) {
      setError("یک خطای غیرمنتظره رخ داد. لطفا دوباره تلاش کنید.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto w-full flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">تنظیمات کاربری</h1>
        <p className="text-sm text-muted-foreground">
          نام کاربری، آواتار، رمز عبور و تنظیمات پیش‌فرض ارسال جلسات به هم‌تیمی خود را از این بخش ویرایش کنید.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Right side - User details (2 columns) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Card 1: User Profile Settings */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold border-b pb-3 flex items-center gap-2">
              <UserIcon className="size-5 text-primary" />
              <span>اطلاعات کاربری</span>
            </h2>

            {/* Dynamic Avatar Preview */}
            <div className="flex flex-col items-center justify-center py-6 bg-muted/20 rounded-2xl border border-border/80 relative overflow-hidden group/avatar-card">
              <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-primary/5 to-transparent" />
              
              <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="relative size-24 rounded-full overflow-hidden border-4 border-background shadow-md bg-background cursor-pointer group transition-all duration-300 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 z-10 animate-fade-in"
                    title="تغییر آواتار"
                  >
                    <img
                      src={`/avatars/${selectedAvatar}`}
                      alt="Profile Preview"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-1 text-white">
                      <Camera className="size-5" />
                      <span className="text-[10px] font-semibold">تغییر آواتار</span>
                    </div>
                  </button>
                </DialogTrigger>
                
                <DialogContent className="max-w-md sm:rounded-2xl p-6">
                  <DialogHeader className="mb-4">
                    <DialogTitle className="text-lg font-bold text-start">انتخاب آواتار کاربری</DialogTitle>
                    <p className="text-xs text-muted-foreground text-start">
                      یکی از آواتارهای حیوانات زیر را برای نمایه کاربری خود انتخاب کنید. آواتار به صورت خودکار ذخیره خواهد شد.
                    </p>
                  </DialogHeader>
                  
                  {isSavingAvatar && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-xs z-50 flex items-center justify-center flex-col gap-2 rounded-2xl">
                      <Loader2 className="size-8 animate-spin text-primary" />
                      <span className="text-sm font-semibold">در حال به‌روزرسانی آواتار...</span>
                    </div>
                  )}

                  <div className="grid grid-cols-4 gap-3 max-h-[350px] overflow-y-auto p-1">
                    {AVATARS.map((avatar) => {
                      const isSelected = selectedAvatar === avatar.file
                      return (
                        <button
                          key={avatar.file}
                          type="button"
                          onClick={() => handleAvatarSelect(avatar.file)}
                          className={cn(
                            "flex flex-col items-center justify-center p-2 rounded-xl border cursor-pointer transition-all duration-200",
                            "hover:scale-105 active:scale-95 group/avatar-btn",
                            isSelected
                              ? "border-primary bg-primary/5 ring-1 ring-primary"
                              : "border-border hover:border-zinc-400 hover:bg-muted/50"
                          )}
                        >
                          <div className="size-12 rounded-lg overflow-hidden bg-background border border-border flex items-center justify-center p-1 group-hover/avatar-btn:rotate-3 transition-transform">
                            <img
                              src={`/avatars/${avatar.file}`}
                              alt={avatar.name}
                              className="size-full object-contain"
                            />
                          </div>
                          <span
                            className={cn(
                              "mt-1 text-[10px] font-semibold truncate w-full text-center",
                              isSelected ? "text-primary font-bold" : "text-muted-foreground"
                            )}
                          >
                            {avatar.name}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </DialogContent>
              </Dialog>

              <span className="mt-3 text-base font-bold text-zinc-950 dark:text-zinc-50 z-10">{user.username}</span>
              <span className="text-xs text-muted-foreground mt-0.5 z-10">پیش‌نمایش نمایه کاربری</span>
            </div>

            {error && (
              <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-xl text-center">
                {error}
              </div>
            )}
            {success && (
              <div className="text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 p-3 rounded-xl text-center">
                {success}
              </div>
            )}

            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="username">نام کاربری</FieldLabel>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  defaultValue={user.username}
                  placeholder="نام کاربری خود را وارد کنید"
                  className="h-10"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">رمز عبور جدید (اختیاری)</FieldLabel>
                <div className="relative w-full">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="رمز عبور جدید را وارد کنید"
                    className="pe-10 h-10"
                    autoComplete="new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:bg-transparent animate-fade-in"
                    aria-label={showPassword ? "پنهان کردن رمز" : "نمایش رمز"}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </Button>
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="confirm-password">تکرار رمز عبور جدید</FieldLabel>
                <div className="relative w-full">
                  <Input
                    id="confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="تکرار رمز عبور جدید را وارد کنید"
                    className="pe-10 h-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:bg-transparent animate-fade-in"
                    aria-label={showConfirmPassword ? "پنهان کردن رمز" : "نمایش رمز"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </Button>
                </div>
              </Field>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 h-10 text-sm flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 active:scale-[0.98]"
              >
                <SaveIcon className="size-4" />
                <span>{isLoading ? "در حال ذخیره‌سازی..." : "ذخیره تغییرات"}</span>
              </Button>
            </FieldGroup>
          </form>
        </div>

        {/* Left side - Session Sharing Settings (1 column) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="flex flex-col gap-6 bg-card border border-border rounded-2xl p-6 shadow-sm h-fit">
            <h2 className="text-lg font-semibold border-b pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2Icon className="size-5 text-primary" />
                <span>اشتراک‌گذاری جلسه</span>
              </div>
              
              {/* Saving status indicator */}
              <div className="flex items-center text-xs min-h-[24px]">
                {sharingSaveStatus === 'saving' && (
                  <span className="flex items-center gap-1 text-muted-foreground animate-pulse">
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>در حال ذخیره...</span>
                  </span>
                )}
                {sharingSaveStatus === 'saved' && (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 dark:bg-emerald-500/25 px-2 py-0.5 rounded-full transition-opacity duration-350">
                    <Check className="size-3.5" />
                    <span>ذخیره شد</span>
                  </span>
                )}
                {sharingSaveStatus === 'error' && (
                  <span className="flex items-center gap-1 text-destructive font-semibold bg-destructive/10 px-2 py-0.5 rounded-full">
                    <AlertCircle className="size-3.5" />
                    <span>خطا</span>
                  </span>
                )}
              </div>
            </h2>

            <div className="flex flex-col gap-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                با فعال‌سازی هر مورد، هنگام ثبت جلسه جدید، گزینه ارسال به هم‌تیمی به صورت پیش‌فرض فعال خواهد بود. تنظیمات بلافاصله ذخیره می‌شوند.
              </p>

              <div className="flex items-center justify-between border border-border rounded-xl p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold">جلسات بازی / مسابقه</span>
                  <span className="text-xs text-muted-foreground">ارسال پیش‌فرض بازی‌ها</span>
                </div>
                <Checkbox
                  id="sendGameToPartner"
                  checked={sendGameToPartner}
                  onCheckedChange={(checked) => handleSharingChange('game', !!checked)}
                />
              </div>

              <div className="flex items-center justify-between border border-border rounded-xl p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold">جلسات تمرین</span>
                  <span className="text-xs text-muted-foreground">ارسال پیش‌فرض تمرین‌ها</span>
                </div>
                <Checkbox
                  id="sendTrainingToPartner"
                  checked={sendTrainingToPartner}
                  onCheckedChange={(checked) => handleSharingChange('training', !!checked)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
