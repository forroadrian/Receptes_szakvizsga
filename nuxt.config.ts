// https://nuxt.com/docs/api/configuration/nuxt-config
const isDev = process.env.NODE_ENV === 'development'

export default defineNuxtConfig({
    vite: {
        optimizeDeps: {
          include: [
            '@vue/devtools-core',
            '@vue/devtools-kit',
            'bootstrap/dist/js/bootstrap.bundle.min.js', // CJS
            'pinia',
          ]
        }
    },
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    css: [
        '~/assets/css/gradients.css',
        '~/assets/css/main.css',
        '~/assets/css/auth.css',
        '~/assets/css/profile.css'
    ],
    modules: ['@nuxtjs/color-mode', '@nuxt/image', '@nuxtjs/supabase', '@vueuse/nuxt', 'nuxt-vitalizer', '@nuxt/fonts', '@nuxtjs/i18n'],
    vitalizer: {
        // disableStylesheets: 'entry'
    },
    fonts: {
        families: [
            { name: 'Poppins', weights: [400, 500, 600, 700, 800], styles: ['normal'] },
            { name: 'Caveat', weights: [600, 700], styles: ['normal'] },
            { name: 'Caveat Brush', weights: [400], styles: ['normal'] },
        ],
        defaults: {
            subsets: ['latin', 'latin-ext'],
            fallbacks: {
                'sans-serif': ['Segoe UI', 'Arial'],
                cursive: ['Segoe Script', 'Brush Script MT'],
            },
        },
    },
    colorMode: {
        preference: 'light',
        fallback: 'light',
        dataValue: 'bs-theme',
        storage: 'cookie',
        storageKey: 'nuxt-color-mode'
    },
    supabase: {
        redirect: false,
        cookieOptions: {
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 8,
        },
        redirectOptions: {
            login: '/login',
            callback: '/confirm',
            exclude: ['/', '/login', '/register'],
            saveRedirectToCookie: true,
        },
    },
    i18n: {
        defaultLocale: 'hu',
        strategy: 'no_prefix',          
        locales: [
            { code: 'hu', name: 'Magyar',  language: 'hu-HU', file: 'hu.json' },
            { code: 'en', name: 'English', language: 'en-US', file: 'en.json' },
        ],                    
        detectBrowserLanguage: {
            useCookie: true,
            cookieKey: 'i18n_redirected',
            redirectOn: 'no prefix',
            fallbackLocale: 'hu',
        },
    },
})