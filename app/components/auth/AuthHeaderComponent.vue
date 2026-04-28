<script setup>
import { onMounted, ref } from 'vue';
import GradSwitch from "~/components/Switch.vue";

const colorMode = useColorMode();
const isReady = ref(false);

onMounted(() => {
    isReady.value = true;
});

const toggleTheme = () => {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
};
</script>

<template>
    <header class="auth-topbar">
        <div class="auth-topbar-inner">
            <NuxtLink to="/" class="auth-brand" :aria-label="$t('auth.brand.aria')">
                <NuxtImg src="/logo.png" :alt="$t('auth.brand.alt')" :title="$t('auth.brand.imgTitle')"
                :width="180"
                :height="128"
                format="webp"
                loading="lazy"
                densities="x1 x2"
                class="auth-brand-logo" />

                <div class="auth-brand-copy">
                    <span class="auth-brand-title">{{ $t('auth.brand.title') }}</span>
                    <span class="auth-brand-subtitle">{{ $t('auth.brand.subtitle') }}</span>
                </div>
            </NuxtLink>

            <div class="auth-topbar-actions">
                <LanguageSwitcher />

                <Button type="button" class="auth-theme-button" @click="toggleTheme"
                    :aria-label="isReady && colorMode.value === 'dark' ? $t('auth.theme.toggleToLight') : $t('auth.theme.toggleToDark')">
                    <span class="auth-theme-icon">
                        <i class="fs-5 pe-2" :class="isReady && colorMode.value === 'dark' ? 'bi bi-moon-stars-fill ' : 'bi bi-sun-fill '"></i>
                    </span>
                    <span>
                        {{ isReady && colorMode.value === 'dark' ? $t('auth.theme.dark') : $t('auth.theme.light') }}
                    </span>
                </Button>

                <NuxtLink to="/" class="grad orange auth-home-link">
                    {{ $t('auth.home') }}
                </NuxtLink>
            </div>
        </div>
    </header>
</template>

<style scoped>
.auth-topbar {
    padding: 1rem 1rem 0;
    width: 100%;
    box-sizing: border-box;
}

.auth-topbar-inner {
    width: 100%;
    max-width: 1080px;
    margin: 0 auto;
    padding: 0.95rem 1.1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    box-sizing: border-box;
    border-radius: 22px;
    border: 1px solid rgba(255, 255, 255, 0.45);
    background: rgba(255, 255, 255, 0.72);
    backdrop-filter: blur(14px);
    box-shadow: 0 14px 30px rgba(0, 0, 0, 0.08);
}

.auth-brand,
.auth-theme-button {
    display: inline-flex;
    align-items: center;
}

.auth-brand {
    gap: 0.85rem;
    min-width: 0;
    text-decoration: none;
    color: inherit;
}

.auth-brand-logo {
    width: var(--brand-logo-width);
    height: auto;
    flex-shrink: 0;
}

.auth-brand-copy {
    min-width: 0;
    display: flex;
    flex-direction: column;
}

.auth-brand-title {
    font-size: 1.05rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--bs-emphasis-color);
}

.auth-brand-subtitle {
    font-size: 0.86rem;
    color: var(--bs-secondary-color);
}

.auth-topbar-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.auth-theme-button,
.auth-home-link {
    height: 44px;
    padding: 0 1rem;
    border-radius: 999px;
    font-size: 0.95rem;
}

.auth-theme-button {
    justify-content: center;
    gap: 0.5rem;
    border: 1px solid var(--border-soft);
    background: rgba(255, 255, 255, 0.82);
    color: var(--bs-body-color);
    font-weight: 500;
    transition: transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
}

.auth-home-link {
    box-shadow: 0 12px 22px rgba(255, 114, 49, 0.24);
}

.auth-theme-button:hover,
.auth-home-link:hover {
    transform: translateY(-1px);
}
 .auth-theme-icon  {
    color: var(--yellow);
}

[data-bs-theme="dark"]  .auth-theme-icon  {
    color: var(--orange);
}

[data-bs-theme="dark"] .auth-topbar-inner {
    border-color: rgba(255, 255, 255, 0.08);
    background: rgba(33, 33, 33, 0.74);
    box-shadow: 0 14px 30px rgba(0, 0, 0, 0.22);
}

[data-bs-theme="dark"] .auth-theme-button {
    border-color: rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.05);
    color: var(--bs-body-color);
}

@media (max-width: 991.98px) {
    .auth-topbar {
        padding: 0.75rem 0.75rem 0;
    }

    .auth-topbar-inner {
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 1rem;
        border-radius: 18px;
    }

    .auth-brand {
        width: 100%;
        flex-direction: column;
        justify-content: center;
        gap: 0.45rem;
    }

    .auth-brand-logo {
        width: 100px;
    }

    .auth-brand-copy {
        align-items: center;
    }

    .auth-brand-subtitle {
        display: none;
    }

    .auth-topbar-actions {
        width: 100%;
        justify-content: center;
        gap: 0.85rem;
        flex-wrap: nowrap;
    }

    .auth-theme-button,
    .auth-home-link {
        flex: 1 1 0;
        width: auto;
        min-width: 0;
        font-size: 0.9rem;
        padding: 0 0.8rem;
    }
}

@media (max-width: 575.98px) {
    .auth-topbar-inner {
        padding: 0.95rem;
    }
}
</style>
