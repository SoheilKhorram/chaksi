"use client"

import { useEffect, useState } from "react"
import { SunIcon, MoonIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const isDark = document.documentElement.classList.contains("dark")
    setTheme(isDark ? "dark" : "light")
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  if (!mounted) {
    return <div className="size-8" />
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-lg text-muted-foreground hover:text-foreground transition-colors"
      title={theme === "light" ? "پوسته تاریک" : "پوسته روشن"}
      aria-label="تغییر پوسته"
    >
      {theme === "light" ? (
        <MoonIcon className="size-[1.2rem] transition-transform duration-300 hover:rotate-12" />
      ) : (
        <SunIcon className="size-[1.2rem] transition-transform duration-300 hover:rotate-45" />
      )}
    </Button>
  )
}
