// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    css: [
        'bootstrap/dist/css/bootstrap.min.css',
        '~/assets/css/main.css',
        'bootstrap-icons/font/bootstrap-icons.css'
    ],
    modules: ['@nuxtjs/color-mode', '@nuxt/image', '@nuxtjs/supabase'],
    colorMode: {
        preference: 'light',
        fallback: 'light',
        dataValue: 'bs-theme',
        storage: 'cookie',
        storageKey: 'nuxt-color-mode'
    },
    supabase: {
        redirect: false,
        redirectOptions: {
            login: '/login',
            callback: '/confirm',
            exclude: ['/', '/login', '/register'],
            saveRedirectToCookie: true,
        },
    },
})