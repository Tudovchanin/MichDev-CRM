
import type { H3Event } from 'h3';


export function clearAuthCookie(e: H3Event) {
  const isProd = process.env.NODE_ENV === 'production';

  setCookie(e, 'tokenRefresh', '', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });
}

export function setAuthCookie(e: any, token: string, validityPeriodMs: number) {
  const isProd = process.env.NODE_ENV === 'production';

  setCookie(e, 'tokenRefresh', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: validityPeriodMs / 1000
  });
}
