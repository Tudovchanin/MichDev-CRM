



export default defineEventHandler((e)=> {
 
  const path = e.path

  if (path.endsWith('login') || path.endsWith('register') || path.endsWith('refresh-token')) {
     console.log('Без токена');
     return;
  }

  const tokenAccess =  getAccessToken(e)
  console.log('Проверка токена', tokenAccess);
  
  try {
    const payload = verifyAccessToken(tokenAccess);;
    e.context.currentUserPayload = payload;
    
  } catch (error) {
    throw createError({ statusCode: 401, message: "Неверный или просроченный токен" });
  }
  
})