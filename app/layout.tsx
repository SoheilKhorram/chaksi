import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip"

const meem = localFont({
  src: [
    {
      path: "../public/fonts/Meem-UltraLight.woff2",
      weight: "50",
      style: "normal",
    },
    {
      path: "../public/fonts/Meem-thin.woff2",
      weight: "100",
      style: "normal",
    },
    {
      path: "../public/fonts/Meem-ExtraLight.woff2",
      weight: "200",
      style: "normal",
    },
    {
      path: "../public/fonts/Meem-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/Meem-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Meem-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/Meem-DemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/Meem-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/Meem-ExtraBold.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "../public/fonts/Meem-Black.woff2",
      weight: "900",
      style: "normal",
    },
    {
      path: "../public/fonts/Meem-UltraBold.woff2",
      weight: "950",
      style: "normal",
    },
  ],
  variable: "--font-meem",
  display: "swap",
})

export const metadata: Metadata = {
  title: "پدل چاکسی | مدیریت جلسات پدل",
  description: "سامانه هوشمند مدیریت، ردیابی جلسات بازی و تمرینات پدل به همراه محاسبات مالی پیشرفته",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={cn("h-full", "antialiased", meem.variable)}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  )
}
