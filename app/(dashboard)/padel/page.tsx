import { redirect } from "next/navigation"
import { getAuthenticatedUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { PadelClient } from "./padel-client"
import { HeaderActions } from "@/components/header-actions"

export default async function Page() {
  const user = await getAuthenticatedUser()

  if (!user) {
    redirect("/login")
  }

  const settings = await prisma.padelSettings.findUnique({
    where: { userId: user.id }
  })

  const sessions = await prisma.padelSession.findMany({
    where: { userId: user.id },
    orderBy: { date: 'desc' }
  })

  // Safely serialize database date and JSON fields for client component transition
  const serializedSessions = sessions.map((session: any) => ({
    id: session.id,
    userId: session.userId,
    date: session.date.toISOString(),
    duration: session.duration,
    players: session.players,
    type: session.type as 'game' | 'training',
    price: session.price,
    extraItems: Array.isArray(session.extraItems)
      ? session.extraItems.map((item: any) => ({
        name: String(item.name || ''),
        price: Number(item.price || 0)
      }))
      : [],
    totalCost: session.totalCost,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
  }))

  const sidebarUser = {
    name: user.username,
  }

  const defaultSettings = settings
    ? { gamePrice: settings.gamePrice, trainingPrice: settings.trainingPrice }
    : { gamePrice: 250000, trainingPrice: 800000 }

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
                  <BreadcrumbPage>جلسات پدل</BreadcrumbPage>
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
        <div className="flex flex-1 flex-col gap-6 p-6">
          <PadelClient
            initialSettings={defaultSettings}
            initialSessions={serializedSessions}
            partner={partner}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
