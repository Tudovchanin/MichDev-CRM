
import type { AccessTokenPayload } from "../utils/jwt";


export default defineEventHandler((e)=> {

  // для разработки, потом убрать
  if (!e.path.startsWith('/api/')) return; 
 
  const path = e.path

  if (path.endsWith('login') || path.endsWith('register') || path.endsWith('refresh-token')) {
     console.log('Без токена доступа');
     return;
  }

  const tokenAccess =  getAccessToken(e)
  
  try {
    const payload = verifyAccessToken(tokenAccess);
    e.context.currentUserPayload = payload as AccessTokenPayload;
    
  } catch (error) {
    throw createError({ statusCode: 401, message: "Неверный или просроченный токен" });
  }
  
})