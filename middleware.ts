import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

export default withAuth(
  async function middleware(req: NextRequest) {
    const url = req.nextUrl;
    const pathname = url.pathname;

    // 이미지, CSS 파일 등 정적 리소스인 경우 요청 그대로 진행
    if (
      pathname.match(/\.(css|scss|jpg|jpeg|png|gif|svg|webp|ico|bmp|tiff)$/i)
    ) {
      return NextResponse.next(); // 정적 리소스는 미들웨어 처리하지 않음
    }

    const token =
      req.cookies.get("next-auth.session-token") ||
      req.cookies.get("__Secure-next-auth.session-token");

    const isLoggedIn = !!token;

    // 로그인한 사용자가 접근하면 대시보드로 redirect
    const noAuthNeededPages = ["/login", "/join", "/forgot-password"];
    if (isLoggedIn && noAuthNeededPages.includes(pathname)) {
      return NextResponse.redirect(new URL("/dashboard", url.origin));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const tokenAccessPage = ["/dashboard", "/schedule", "/community"];
        const { pathname } = req.nextUrl;
        if (tokenAccessPage.includes(pathname)) {
          return !!token;
        }
        return true;
      },
    },
    pages: {
      signIn: "/login", // 인증 실패시 리다이렉트할 로그인 페이지
    },
  }
);

export const config = {
  // 개별 경로를 명시적으로 지정
  matcher: [
    // 제외할 경로들
    "/((?!_next|favicon.ico|img|images).*)",
  ],
};
