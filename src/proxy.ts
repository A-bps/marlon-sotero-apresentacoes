import { NextResponse, type NextRequest } from "next/server";

const MAP_ORIGIN = "https://www.openstreetmap.org";

export function proxy(request: NextRequest) {
  const isDev = process.env.NODE_ENV === "development";

  // Na Vercel o redirecionamento HTTP→HTTPS já é automático; isto cobre outros hosts atrás de proxy.
  // O `next start` define x-forwarded-proto=http mesmo sem proxy, por isso localhost fica de fora.
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
  const local = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host);
  if (!isDev && !local && request.headers.get("x-forwarded-proto") === "http") {
    const { pathname, search } = request.nextUrl;
    return NextResponse.redirect(`https://${host.replace(/:\d+$/, "")}${pathname}${search}`, 308);
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  // style-src precisa de 'unsafe-inline': next/image e React emitem atributos style="" no HTML,
  // que nonces não cobrem. Scripts continuam restritos ao nonce.
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src 'self'${isDev ? " ws:" : ""}`,
    `frame-src ${MAP_ORIGIN}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon.ico|marlon/|imoveis/).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
