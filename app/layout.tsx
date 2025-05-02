import type { Metadata } from 'next'
import React from 'react'
import { Noto_Sans_KR } from 'next/font/google'
import './globals.css'
import './editor.css'
import ReactQueryProvider from '@/provider/react-query-provider'
import NextAuthProvider from '@/provider/next-auth-provider'
import { ThemeProvider } from 'next-themes'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { Toaster } from 'sonner'
import { guildName } from '@/shared/constants/game'

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-noto-sans-kr',
})

export const metadata: Metadata = {
  title: guildName,
  description: `마비노기 모바일 ${guildName} 길드 커뮤니티`,
  icons: {
    icon: '/images/favicon-mabinogi-mobile-luckybiki-logo.png', // public 폴더 기준 경로
  },
}

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
    <body
      className={`${notoSansKR.variable} font-sans min-h-screen bg-background text-foreground bg-[url('/images/bg-mabinogi-mobile-main.jpg')] bg-fixed bg-cover bg-center`}
    >
    <NextAuthProvider>
      <ReactQueryProvider>
          <ThemeProvider
            attribute="data-theme"
            defaultTheme="dark"
            enableSystem
          >
            <div className="min-h-screen backdrop-blur-sm backdrop-brightness-80">
              <Header />
              <main>{children}</main>
              <Footer />
            </div>
            <Toaster position="top-center" richColors />
          </ThemeProvider>
      </ReactQueryProvider>
    </NextAuthProvider>

    </body>
    </html>
  )
}