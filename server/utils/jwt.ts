
import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';

// types для токенов
export type AccessTokenPayload = { sub: string; role: string; iat: number; exp: number };
export type RefreshTokenPayload = { sub: string; iat: number; exp: number };
export type ActivateEmailTokenPayload = { sub: string; iat: number; exp: number };

export function createAccessToken(payload: {userId:string, role:string}):string {
  const config = useRuntimeConfig();
  const secret = config.jwtAccessSecret;
  return jwt.sign(
    { sub: payload.userId, role: payload.role }, // sub — стандарт для ID
    secret,
    { expiresIn: '15m' }
  );
}

export function createRefreshToken(payload: {userId:string}):string {
  const config = useRuntimeConfig();
  const secret = config.jwtRefreshSecret;
  return jwt.sign(
    { sub: payload.userId },
    secret,
    { expiresIn: '7d' }
  );
}

// Валидирует access token
export function verifyAccessToken(token: string): AccessTokenPayload  {
  const config = useRuntimeConfig();
  return jwt.verify(token, config.jwtAccessSecret) as AccessTokenPayload; 
}

// Валидирует refresh token
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const config = useRuntimeConfig();
  return jwt.verify(token, config.jwtRefreshSecret) as RefreshTokenPayload;
}

// Жизнь токена обновления
export function getTokenExpiryDate(validityPeriodMs: number): Date {
  return new Date(Date.now() + validityPeriodMs);
}





// Токен для почты
export function createActivateEmailToken(payload: {userId:string} ):string {
  const config = useRuntimeConfig();
  return jwt.sign(
    { sub: payload.userId },
    config.jwtActivateEmailSecret,
    { expiresIn: '1d' }
  );}

export function verifyActivateEmailToken(token: string): ActivateEmailTokenPayload{
  const config = useRuntimeConfig();
  return jwt.verify(token, config.jwtActivateEmailSecret) as ActivateEmailTokenPayload;
}