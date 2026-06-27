"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { GalleryVerticalEndIcon, Eye, EyeOff } from "lucide-react"
import { signupAction } from "@/app/actions/auth"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData(event.currentTarget)
    try {
      const res = await signupAction(formData)
      if (res.success) {
        setSuccess("حساب کاربری با موفقیت ایجاد شد! در حال انتقال...")
        setTimeout(() => {
          router.push("/padel")
          router.refresh()
        }, 1000)
      } else {
        setError(res.error || "خطایی در حین ثبت‌نام رخ داد.")
      }
    } catch (err) {
      setError("یک خطای غیرمنتظره رخ داد. لطفا دوباره تلاش کنید.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEndIcon className="size-6" />
              </div>
              <span className="sr-only">پدل چاکسی</span>
            </a>
            <h1 className="text-xl font-bold">به چاکسی خوش اومدی</h1>
            <FieldDescription>
              قبلاً ثبت‌نام کردی؟ <Link href="/login">وارد شو</Link>
            </FieldDescription>
          </div>
          {error && (
            <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="text-sm font-medium text-green-600 bg-green-50 dark:bg-green-950/20 dark:text-green-400 p-3 rounded-md text-center">
              {success}
            </div>
          )}
          <Field>
            <FieldLabel htmlFor="username">نام کاربری</FieldLabel>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="نام کاربری خود را وارد کنید"
              className="h-9"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">رمز عبور</FieldLabel>
            <div className="relative w-full">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="pe-9 h-9"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground active:not-aria-[haspopup]:-translate-y-1/2"
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
            <FieldLabel htmlFor="confirm-password">تایید رمز عبور</FieldLabel>
            <div className="relative w-full">
              <Input
                id="confirm-password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                className="pe-9 h-9"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground active:not-aria-[haspopup]:-translate-y-1/2"
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
          <Field>
            <Button size="lg" type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "در حال ساخت حساب..." : "ایجاد حساب کاربری"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  )
}
