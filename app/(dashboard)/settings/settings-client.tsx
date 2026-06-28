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
import { Eye, EyeOff, SaveIcon, UserIcon, Share2 as Share2Icon } from "lucide-react"
import { updateUserSettingsAction } from "@/app/actions/user"
import { Checkbox } from "@/components/ui/checkbox"

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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData(event.currentTarget)
    // Append the selected avatar and sharing settings
    formData.set("avatar", selectedAvatar)
    formData.set("sendGameToPartner", sendGameToPartner ? "on" : "off")
    formData.set("sendTrainingToPartner", sendTrainingToPartner ? "on" : "off")

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

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Right side - Form details (1 column) */}
        <div className="lg:col-span-1 flex flex-col gap-6 h-fit">
          {/* Card 1: User Profile Settings */}
          <div className="flex flex-col gap-6 bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold border-b pb-3 flex items-center gap-2">
              <UserIcon className="size-5 text-primary" />
              <span>اطلاعات کاربری</span>
            </h2>

            {/* Dynamic Avatar Preview */}
            <div className="flex flex-col items-center justify-center py-4 bg-muted/30 rounded-xl border border-dashed border-border">
              <div className="relative size-24 rounded-2xl overflow-hidden border-2 border-primary shadow-lg bg-background transition-transform duration-300 hover:scale-105 hover:rotate-2">
                <img
                  src={`/avatars/${selectedAvatar}`}
                  alt="Profile Preview"
                  className="size-full object-cover"
                />
              </div>
              <span className="mt-3 text-sm font-medium">{user.username}</span>
              <span className="text-xs text-muted-foreground mt-1">پیش‌نمایش نمایه کاربری</span>
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
                    className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:bg-transparent"
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
                    className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:bg-transparent"
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
                className="w-full mt-2 h-10 text-sm flex items-center justify-center gap-2 cursor-pointer transition-transform duration-200 active:scale-[0.98]"
              >
                <SaveIcon className="size-4" />
                <span>{isLoading ? "در حال ذخیره‌سازی..." : "ذخیره تغییرات"}</span>
              </Button>
            </FieldGroup>
          </div>

          {/* Card 2: Session Sharing Settings */}
          <div className="flex flex-col gap-6 bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold border-b pb-3 flex items-center gap-2">
              <Share2Icon className="size-5 text-primary" />
              <span>تنظیمات اشتراک‌گذاری جلسه</span>
            </h2>

            <div className="flex flex-col gap-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                با فعال‌سازی هر مورد، هنگام ثبت جلسه جدید، گزینه ارسال به هم‌تیمی به صورت پیش‌فرض فعال خواهد بود.
              </p>

              <div className="flex items-center justify-between border border-border rounded-xl p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold">جلسات بازی / مسابقه</span>
                  <span className="text-xs text-muted-foreground">ارسال پیش‌فرض بازی‌ها</span>
                </div>
                <Checkbox
                  id="sendGameToPartner"
                  checked={sendGameToPartner}
                  onCheckedChange={(checked) => setSendGameToPartner(!!checked)}
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
                  onCheckedChange={(checked) => setSendTrainingToPartner(!!checked)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Left side - Avatar grid selection (2 columns) */}
        <div className="lg:col-span-2 flex flex-col gap-6 bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="border-b pb-3 flex flex-col gap-1">
            <h2 className="text-lg font-semibold">انتخاب آواتار نمایه</h2>
            <p className="text-xs text-muted-foreground">
              یکی از آواتارهای حیوانات زیر را برای نمایه کاربری خود انتخاب کنید:
            </p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-2">
            {AVATARS.map((avatar) => {
              const isSelected = selectedAvatar === avatar.file
              return (
                <button
                  key={avatar.file}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar.file)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-2xl border-2 cursor-pointer transition-all duration-300",
                    "hover:scale-105 active:scale-95 group",
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-muted-foreground/30 hover:bg-accent/40"
                  )}
                >
                  <div className="size-16 rounded-xl overflow-hidden bg-background border border-border flex items-center justify-center p-1 group-hover:rotate-3 transition-transform">
                    <img
                      src={`/avatars/${avatar.file}`}
                      alt={avatar.name}
                      className="size-full object-contain"
                    />
                  </div>
                  <span
                    className={cn(
                      "mt-2 text-xs font-semibold tracking-wide",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {avatar.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </form>
    </div>
  )
}
