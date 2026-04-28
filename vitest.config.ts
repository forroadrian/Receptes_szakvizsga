import { fileURLToPath } from 'node:url'
import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
    test: {
        globals: true,
        environment: 'happy-dom',
        environmentMatchGlobs: [
            ['app/components/**', 'nuxt'],
            ['app/pages/**', 'nuxt'],
            ['app/layouts/**', 'nuxt'],
            ['tests/components/**', 'nuxt'],
            ['tests/pages/**', 'nuxt'],
        ],
        include: [
            'tests/**/*.{test,spec}.{ts,js}',
            'app/**/*.{test,spec}.{ts,js}',
            'server/**/*.{test,spec}.{ts,js}',
        ],
        exclude: [
            'node_modules',
            '.nuxt',
            '.output',
            '.vercel',
            'dist',
        ],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            include: [
                'app/composables/**',
                'app/stores/**',
                'app/utils/**',
                'server/api/**',
                'server/utils/**',
            ],
            exclude: [
                '**/*.{test,spec}.{ts,js}',
                '**/*.d.ts',
            ],
        },
    },
    resolve: {
        alias: {
            '~': fileURLToPath(new URL('./app', import.meta.url)),
            '@': fileURLToPath(new URL('./app', import.meta.url)),
            '~~': fileURLToPath(new URL('./', import.meta.url)),
            '@@': fileURLToPath(new URL('./', import.meta.url)),
        },
    },
})
