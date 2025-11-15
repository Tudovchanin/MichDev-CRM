// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // ssr: false, 
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  css: ['~/assets/scss/main.scss'],
  modules: ['@pinia/nuxt', '@prisma/nuxt'],
  runtimeConfig: {
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    jwtActivateEmailSecret: process.env.JWT_ACTIVATE_EMAIL_SECRET,
    
    smtpHost: process.env.SMTP_HOST,
    smtpPort: Number(process.env.SMTP_PORT),
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASSWORD,
  
    activationLink: process.env.ACTIVATION_LINK_BASE,
    activationRedirectURL: process.env.ACTIVATION_REDIRECT_URL,
    activationErrorRedirectURL: process.env.ERROR_PAGE_ACTIVATE
  }
})