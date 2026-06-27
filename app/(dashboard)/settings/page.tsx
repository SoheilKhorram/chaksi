import { redirect } from "next/navigation"
import { getAuthenticatedUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { HeaderActions } from "@/components/header-actions"
import { SettingsClient } from "./settings-client"

export default async function Page() {
  const user = await getAuthenticatedUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch active partner connection
  const activePartnership = await prisma.partnerRequest.findFirst({
    where: {
      status: 'ACCEPTED',
      OR: [
        { senderId: user.id },
        { receiverId: user.id }
      ]
    },
    include: {
      sender: { select: { id: true, username: true } },
      receiver: { select: { id: true, username: true } }
    }
  })

  const partner = activePartnership
    ? (activePartnership.senderId === user.id ? activePartnership.receiver : activePartnership.sender)
    : null

  // Fetch incoming pending partner requests
  const receivedRequests = await prisma.partnerRequest.findMany({
    where: {
      receiverId: user.id,
      status: 'PENDING'
    },
    include: {
      sender: { select: { id: true, username: true } }
    }
  })

  // Fetch outgoing pending partner requests
  const sentRequests = await prisma.partnerRequest.findMany({
    where: {
      senderId: user.id,
      status: 'PENDING'
    },
    include: {
      receiver: { select: { id: true, username: true } }
    }
  })

  const sidebarUser = {
    name: user.username,
    avatar: `/avatars/${user.avatar || 'cat.png'}`,
  }

  const serializedUser = {
    username: user.username,
    avatar: user.avatar || 'cat.png',
  }

  return (
    <SidebarProvider>
      <AppSidebar user={sidebarUser} partner={partner} />
      <SidebarInset className="overflow-hidden rounded-2xl">
        <header className="flex h-16 shrink-0 items-center rounded-t-2xl justify-between border-b border-sidebar-border bg-background px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ms-1" />
            <Separator
              orientation="vertical"
              className="me-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>تنظیمات کاربری</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <HeaderActions
            user={{ id: user.id, username: user.username }}
            partner={partner}
            receivedRequests={receivedRequests}
            sentRequests={sentRequests}
          />
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6 overflow-y-auto">
          <SettingsClient user={serializedUser} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
