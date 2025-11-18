


import type { RefreshTokenRepository } from "~/types/backend/tokenRepo";

class RefreshTokenService {
  constructor(private refreshTokenRepository: RefreshTokenRepository) {}

  async getToken(userId: string) {
    return this.refreshTokenRepository.findByUserId(userId);
  }

  async saveToken(userId: string, token: string, expiresAt: Date) {
    return this.refreshTokenRepository.saveToken(userId, token, expiresAt);
  }

  async deleteToken(userId: string) {
    return this.refreshTokenRepository.deleteToken(userId);
  }

}


export default RefreshTokenService;

