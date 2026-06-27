"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

import { NavMain } from "@/components/nav-main"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { GalleryVerticalEndIcon, TrophyIcon, SettingsIcon } from "lucide-react"
import { NavUser } from "@/components/nav-user"

const teams = [
  {
    name: "چاکسی",
    logo: (
      <GalleryVerticalEndIcon
      />
    ),
    plan: "مدیریت پدل",
  },
]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name: string;
    avatar?: string;
  };
  partner?: { id: string; username: string } | null;
}

export function AppSidebar({ user, partner = null, ...props }: AppSidebarProps) {
  const pathname = usePathname()
  const displayUser = user ? { ...user, partner } : undefined

  const navMain = [
    {
      title: "جلسات پدل",
      url: "/padel",
      icon: (
        <TrophyIcon />
      ),
      isActive: pathname === "/padel",
    },
    {
      title: "تنظیمات کاربری",
      url: "/settings",
      icon: (
        <SettingsIcon />
      ),
      isActive: pathname === "/settings",
    },
  ]

  return (
    <Sidebar variant="inset" collapsible="icon" side="right" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      {displayUser && (
        <SidebarFooter>
          <NavUser user={displayUser} />
        </SidebarFooter>
      )}
    </Sidebar>
  )
}
