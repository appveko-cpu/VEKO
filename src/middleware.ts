import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const MAX_SESSION_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const SESSION_COOKIE = "veko_session_start";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (user) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE);

    if (!sessionCookie) {
      response.cookies.set(SESSION_COOKIE, String(Date.now()), {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 35 * 24 * 60 * 60,
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });
    } else {
      const sessionStart = parseInt(sessionCookie.value, 10);
      if (!isNaN(sessionStart) && Date.now() - sessionStart > MAX_SESSION_AGE_MS) {
        await supabase.auth.signOut({ scope: "local" });
        response.cookies.delete(SESSION_COOKIE);
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("reason", "session_expired");
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  if (!user && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (user && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
