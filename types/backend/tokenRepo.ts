import type { RefreshToken } from "../shared";


export type RefreshTokenRepository = {
  findByUserId(userId: string): Promise<RefreshToken | null>;

  saveToken(userId: string, token: string, expiresAt: Date): Promise<RefreshToken>;

  deleteToken(userId: string): Promise<RefreshToken>

}
