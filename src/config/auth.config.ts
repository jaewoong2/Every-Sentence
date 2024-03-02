import { registerAs } from '@nestjs/config';

// src/config/auth.config.ts
export const authConfig = registerAs('auth', () => ({
  auth: {
    secretKey: process.env.SECRET_KEY,
    refreshToken: { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN },
    accessToken: { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN },
    redirect: process.env.LOGIN_REDIRECT_URL,
    openAiAPIKey: process.env.OPENAIAPI_KEY,
  },
}));
