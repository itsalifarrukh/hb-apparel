import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/sign-in", 
    "/sign-up", 
    "/", 
    "/verify/:path*",
    "/api/cart/:path*",
    "/api/wishlist/:path*"
  ],
};

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  // Redirect to dashboard if the user is already authenticated
  // and trying to access sign-in, sign-up, or home page
  if (
    token &&
    (url.pathname.startsWith("/sign-in") ||
      url.pathname.startsWith("/sign-up") ||
      url.pathname.startsWith("/verify"))
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protect dashboard routes
  if (!token && url.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Protect API routes that require authentication
  if (!token && (url.pathname.startsWith("/api/cart") || url.pathname.startsWith("/api/wishlist"))) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized. Please sign in to access this resource.",
      },
      { status: 401 }
    );
  }

  return NextResponse.next();
}
