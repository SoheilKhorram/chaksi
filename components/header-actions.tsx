"use client"

import { useRouter } from "next/navigation"
import { LogOutIcon, UsersIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { logoutAction } from "@/app/actions/auth"
import { useState } from "react"
import { PartnerDialog } from "@/components/partner-dialog"
import { LogoutDialog } from "@/components/logout-dialog"

interface HeaderActionsProps {
  user?: { id: string; username: string; displayId: string } | null
  partner?: { id: string; username: string; displayId: string } | null
  receivedRequests?: Array<{ id: string; sender: { id: string; username: string; displayId: string } }>
  sentRequests?: Array<{ id: string; receiver: { id: string; username: string; displayId: string } }>
}

export function HeaderActions({
  user,
  partner = null,
  receivedRequests = [],
  sentRequests = []
}: HeaderActionsProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showPartnerModal, setShowPartnerModal] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

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
      setShowLogoutConfirm(false)
    }
  }

  const hasNotifications = receivedRequests.length > 0

  return (
    <div className="flex items-center gap-2">
      <ThemeToggle />

      {user && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowPartnerModal(true)}
            className="relative rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            title="مدیریت هم‌تیمی"
            aria-label="مدیریت هم‌تیمی"
          >
            <UsersIcon className="size-[1.2rem]" />
            {hasNotifications && (
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
            )}
          </Button>

          <PartnerDialog
            open={showPartnerModal}
            onOpenChange={setShowPartnerModal}
            userId={user.displayId}
            partner={partner}
            receivedRequests={receivedRequests}
            sentRequests={sentRequests}
          />
        </>
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowLogoutConfirm(true)}
        disabled={isLoggingOut}
        className="rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        title="خروج از حساب کاربری"
        aria-label="خروج از حساب"
      >
        <LogOutIcon className="size-[1.2rem]" />
      </Button>

      <LogoutDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        onConfirm={handleLogout}
        isPending={isLoggingOut}
      />
    </div>
  )
}
