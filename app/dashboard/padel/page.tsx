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
  const serializedSessions = sessions.map(session => ({
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
    : { gamePrice: 0, trainingPrice: 0 }

  return (
    <SidebarProvider>
      <AppSidebar user={sidebarUser} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ms-1" />
            <Separator
              orientation="vertical"
              className="me-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Padel Tracker</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6 bg-zinc-50/50 dark:bg-zinc-950/20">
          <PadelClient 
            initialSettings={defaultSettings}
            initialSessions={serializedSessions}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
