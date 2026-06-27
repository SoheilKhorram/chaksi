"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { GalleryVerticalEndIcon, TrophyIcon } from "lucide-react"
import { NavUser } from "@/components/nav-user"

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
    name: string;
    avatar?: string;
  };
  partner?: { id: string; username: string } | null;
}

export function AppSidebar({ user, partner = null, ...props }: AppSidebarProps) {
  const displayUser = user ? { ...user, partner } : undefined

  return (
    <Sidebar variant="inset" collapsible="icon" side="right" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      {displayUser && (
        <SidebarFooter>
          <NavUser user={displayUser} />
        </SidebarFooter>
      )}
    </Sidebar>
  )
}
