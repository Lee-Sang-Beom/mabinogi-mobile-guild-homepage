import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

export default withAuth(
  async function middleware(req: NextRequest) {
    const url = req.nextUrl;
    const pathname = url.pathname;

    // 이미지, CSS 파일 등 정적 리소스인 경우 요청 그대로 진행
    if (pathname.match(/\.(css|scss|jpg|jpeg|png|gif|svg|webp|ico|bmp|tiff)$/i)) {
      return NextResponse.next(); // 정적 리소스는 미들웨어 처리하지 않음
    }

    const token =
      req.cookies.get("next-auth.session-token") ||
      req.cookies.get("__Secure-next-auth.session-token");

    const isLoggedIn = !!token;

    console.log('isLoggedIn? ', isLoggedIn)
    console.log('pathname? ', pathname)

    // 로그인한 사용자가 접근하면 대시보드로 리다이렉트되는 페이지들
    const noAuthNeededPages = ["/login", "/join", "/forgot-password"];
    const isNoAuthNeededPage = noAuthNeededPages.includes(pathname);

    // 로그인 없이 접근 가능한 페이지들
    const publicAccessPages = ["/", ...noAuthNeededPages];
    const isPublicAccessPage = publicAccessPages.includes(pathname);

    // 로그인한 사용자가 인증 페이지(로그인, 회원가입, 비밀번호찾기)에 접근하는 경우 대시보드로 리다이렉트
    if (isLoggedIn && isNoAuthNeededPage) {
      const dashboardUrl = new URL("/dashboard", url.origin);
      return NextResponse.redirect(dashboardUrl);
    }

    // 로그인하지 않은 사용자가 접근 가능한 페이지가 아닌 경우 로그인 페이지로 리다이렉트
    // dashboard 페이지는 callbacks.authorized에서 처리하므로 여기서 제외
    if (!isLoggedIn && !isPublicAccessPage && !pathname.includes("/dashboard")) {
      const loginUrl = new URL("/login", url.origin);
      loginUrl.searchParams.set("callbackUrl", pathname); // 로그인 후 돌아올 경로
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next(); // 조건에 해당하지 않는 요청은 그대로 허용
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // dashboard 페이지 접근시 토큰 검사
        if (req.nextUrl.pathname.includes("/dashboard")) {
          return !!token; // 토큰이 있으면 true, 없으면 false 반환
        }
        // 다른 페이지는 미들웨어 함수에서 처리
        return true;
      },
    },
    pages: {
      signIn: "/login", // 인증 실패시 리다이렉트할 로그인 페이지
    }
  }
);

export const config = {
  // 개별 경로를 명시적으로 지정
  matcher: [
    // 제외할 경로들
    '/((?!_next|favicon.ico|img|images).*)',
  ],
};