import { redirect } from "next/navigation"
import { getAuthenticatedUser } from "@/lib/auth"
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
import { TrophyIcon, SettingsIcon, ArrowLeftIcon } from "lucide-react"

export default async function Page() {
  const user = await getAuthenticatedUser()
  
  if (!user) {
    redirect("/login")
  }

  const sidebarUser = {
    name: user.username,
  }

  return (
    <SidebarProvider>
      <AppSidebar user={sidebarUser} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-background">
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
                    میز کار
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>داشبورد اصلی</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6 bg-zinc-50/50 dark:bg-zinc-950/20">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-black text-zinc-900 dark:text-zinc-50">سلام، {user.username}! 👋</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">به پنل مدیریت پدل خوش آمدید. از بخش‌های زیر برای ردیابی فعالیت‌های خود استفاده کنید.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Quick Link Card 1: Padel Sessions */}
            <div className="group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs hover:shadow-md transition-all dark:border-zinc-800/80 dark:bg-zinc-900/50">
              <div className="absolute top-0 start-0 -mt-4 -ms-4 h-24 w-24 rounded-full bg-primary/10 blur-xl"></div>
              <div className="flex items-center justify-between mb-4">
                <div className="rounded-xl bg-primary/10 p-3 text-primary">
                  <TrophyIcon className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">ردیاب جلسات پدل</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 leading-5">
                بازی‌ها، تمرینات، هزینه‌های زمین و وسایل جانبی خود را به همراه آمار دقیق ردیابی و مدیریت کنید.
              </p>
              <a
                href="/dashboard/padel"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                ورود به بخش جلسات پدل
                <ArrowLeftIcon className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Quick Link Card 2: Settings Placeholder */}
            <div className="group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs hover:shadow-md transition-all dark:border-zinc-800/80 dark:bg-zinc-900/50">
              <div className="flex items-center justify-between mb-4">
                <div className="rounded-xl bg-zinc-100 p-3 text-zinc-500 dark:bg-zinc-800">
                  <SettingsIcon className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">تنظیمات کاربری</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 leading-5">
                نرخ‌های پیش‌فرض ساعتی خود را برای مسابقات و جلسات تمرینی شخصی‌سازی کنید.
              </p>
              <a
                href="/dashboard/padel"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                تنظیم نرخ‌ها در بخش پدل
                <ArrowLeftIcon className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
