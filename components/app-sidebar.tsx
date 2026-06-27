"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { GalleryVerticalEndIcon, TrophyIcon } from "lucide-react"

// This is sample data.
const data = {
  teams: [
    {
      name: "چاکسی",
      logo: (
        <GalleryVerticalEndIcon
        />
      ),
      plan: "مدیریت پدل",
    },
  ],
  navMain: [
    {
      title: "جلسات پدل",
      url: "/padel",
      icon: (
        <TrophyIcon />
      ),
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name: string
    email?: string
    avatar?: string
  }
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  // const displayUser = user

  return (
    <Sidebar variant="inset" collapsible="icon" side="right" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
    </Sidebar>
  )
}
