<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const { t } = useI18n()

const isNotFound = computed(() => props.error?.statusCode === 404)

const title = computed(() => {
    if (isNotFound.value) return t('error.notFound.title')
    return t('error.generic.title')
})

const message = computed(() => {
    if (props.error?.statusMessage) return props.error.statusMessage
    if (isNotFound.value) return t('error.notFound.message')
    return t('error.generic.message')
})

const handleHome = () => clearError({ redirect: '/' })
</script>

<template>
    <NuxtLayout>
        <section class="error-page">
            <div class="error-shell">
                <p class="error-status" aria-hidden="true">{{ error.statusCode }}</p>
                <h1 class="error-title">{{ title }}</h1>
                <p class="error-message">{{ message }}</p>
                <button type="button" class="error-cta" @click="handleHome">
                    <i class="bi bi-arrow-left me-2" aria-hidden="true"></i>
                    {{ t('error.home') }}
                </button>
            </div>
        </section>
    </NuxtLayout>
</template>

<style scoped>
.error-page {
    min-height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
}

.error-shell {
    max-width: 520px;
    text-align: center;
    background: var(--bs-body-bg);
}

.error-status {
    font-family: "Caveat Brush", cursive;
    font-size: clamp(5rem, 14vw, 9rem);
    margin: 0;
    line-height: 1;
    color: var(--orange);
    text-shadow: 0 4px 0 rgba(255, 114, 49, 0.18);
}

.error-title {
    font-family: "Caveat Brush", cursive;
    font-size: clamp(1.6rem, 4vw, 2.2rem);
    color: var(--bs-emphasis-color);
    margin: 0.5rem 0 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.02em;
}

.error-message {
    color: var(--bs-secondary-color);
    margin-bottom: 1.75rem;
}

.error-cta {
    display: inline-flex;
    align-items: center;
    padding: 0.6rem 1.4rem;
    border-radius: var(--radius-sm);
    border: 0;
    background: var(--grad-orange);
    color: var(--text-light);
    font-weight: 600;
    cursor: pointer;
    transition: filter 0.15s ease-in;
}

.error-cta:hover {
    filter: brightness(0.95);
}

.error-cta:focus-visible {
    outline: 2px solid var(--orange);
    outline-offset: 3px;
}
</style>
