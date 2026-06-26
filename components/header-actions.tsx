"use client"

import { useRouter } from "next/navigation"
import { LogOutIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { logoutAction } from "@/app/actions/auth"
import { useState } from "react"

export function HeaderActions() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      const res = await logoutAction()
      if (res.success) {
        router.push("/login")
        router.refresh()
      }
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <ThemeToggle />
      <Button
        variant="ghost"
        size="icon"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        title="خروج از حساب کاربری"
        aria-label="خروج از حساب"
      >
        <LogOutIcon className="size-[1.2rem]" />
      </Button>
    </div>
  )
}
