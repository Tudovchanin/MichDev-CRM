
import type { AccessTokenPayload } from "../utils/jwt";


export default defineEventHandler((e) => {

  const path = e.path

  const publicApi = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh-token'
  ]

  if (!path.startsWith('/api/') || publicApi.includes(path)) {
    return
  }

  const tokenAccess = getAccessToken(e)

  try {
    const payload = verifyAccessToken(tokenAccess);
    e.context.currentUserPayload = payload as AccessTokenPayload;

  } catch (error) {
    throw createError({ statusCode: 401, message: "Неверный или просроченный токен" });
  }

})