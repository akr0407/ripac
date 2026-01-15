// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss', 'nuxt-auth-utils'],

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.ts',
  },

  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap' },
      ],
    },
  },

  runtimeConfig: {
    // SSO Configuration (server-side only)
    sso: {
      clientId: process.env.SSO_CLIENT_ID || '',
      clientSecret: process.env.SSO_CLIENT_SECRET || '',
      issuerUrl: process.env.SSO_ISSUER_URL || '',
      redirectUri: process.env.SSO_REDIRECT_URI || 'http://localhost:3000/api/auth/sso/callback',
    },

    // Hospital API Credentials (server-side only, URL configured per organization)
    hospitalApi: {
      username: process.env.HOSPITAL_API_USERNAME || '',
      password: process.env.HOSPITAL_API_PASSWORD || '',
    },

    // Session secret
    session: {
      password: process.env.NUXT_SESSION_PASSWORD || 'your-super-secret-session-password-min-32-chars',
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      },
    },
    public: {
      // Public SSO config (for client-side)
      ssoEnabled: !!process.env.SSO_CLIENT_ID,
    },
  },
});

