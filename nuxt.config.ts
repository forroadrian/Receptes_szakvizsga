// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    css: [
        'bootstrap/dist/css/bootstrap.min.css',
        'bootstrap-icons/font/bootstrap-icons.css',
        '~/assets/css/gradients.css',
        '~/assets/css/main.css',
        '~/assets/css/auth.css',
        '~/assets/css/profile.css'
    ],
    modules: ['@nuxtjs/color-mode', '@nuxt/image', '@nuxtjs/supabase', '@vueuse/nuxt'],
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
})