import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "@/provider/react-query-provider";
import NextAuthProvider from "@/provider/next-auth-provider";
import { ThemeProvider } from "next-themes";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-noto-sans-kr",
});

export const metadata: Metadata = {
  title: "마비노기 모바일 길드",
  description: "마비노기 모바일 판타지 길드 커뮤니티",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${notoSansKR.variable} font-sans min-h-screen bg-background text-foreground bg-[url('/images/bg-mabinogi-mobile-01.jpg')] bg-fixed bg-cover bg-center`}
      >
        <ReactQueryProvider>
          <NextAuthProvider>
            <ThemeProvider
              attribute="data-theme"
              defaultTheme="dark"
              enableSystem
            >
              <div className="min-h-screen backdrop-blur-sm backdrop-brightness-50">
                <Header />
                <main>{children}</main>
                <Footer />
              </div>
            </ThemeProvider>
          </NextAuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
