<script setup>
import { onMounted, ref } from 'vue';

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
            <NuxtLink to="/" class="auth-brand" aria-label="Vissza a kezdőlapra">
                <img src="/logo.png" alt="Receptes logó" title="Receptes logó" class="auth-brand-logo" />

                <div class="auth-brand-copy">
                    <span class="auth-brand-title">Menuplanr</span>
                    <span class="auth-brand-subtitle">Receptek, tervezés, személyre szabva</span>
                </div>
            </NuxtLink>

            <div class="auth-topbar-actions">
                <button type="button" class="auth-theme-button" @click="toggleTheme"
                    :aria-label="isReady && colorMode.value === 'dark' ? 'Váltás világos témára' : 'Váltás sötét témára'">
                    <span class="auth-theme-icon">
                        {{ isReady && colorMode.value === 'dark' ? '🌙' : '☀️' }}
                    </span>
                    <span>
                        {{ isReady && colorMode.value === 'dark' ? 'Sötét téma' : 'Világos téma' }}
                    </span>
                </button>

                <NuxtLink to="/" class="grad orange auth-home-link">
                    Vissza a főoldalra
                </NuxtLink>
            </div>
        </div>
    </header>
</template>

<style scoped>
.auth-topbar {
    padding: 1rem 1rem 0;
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
    border-radius: 22px;
    border: 1px solid rgba(255, 255, 255, 0.45);
    background: rgba(255, 255, 255, 0.72);
    backdrop-filter: blur(14px);
    box-shadow: 0 14px 30px rgba(0, 0, 0, 0.08);
}

.auth-brand {
    display: inline-flex;
    align-items: center;
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

.auth-theme-button {
    height: 44px;
    padding: 0 1rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border-radius: 999px;
    border: 1px solid var(--border-soft);
    background: rgba(255, 255, 255, 0.82);
    color: var(--bs-body-color);
    font-size: 0.95rem;
    font-weight: 500;
    transition: transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
}

.auth-home-link {
    height: 44px;
    padding: 0 1rem;
    border-radius: 999px;
    font-size: 0.95rem;
    box-shadow: 0 12px 22px rgba(255, 114, 49, 0.24);
}

.auth-theme-button:hover,
.auth-home-link:hover {
    transform: translateY(-1px);
}

.auth-theme-icon {
    font-size: 1rem;
    line-height: 1;
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
        padding: 0.85rem 0.95rem;
        border-radius: 18px;
    }

    .auth-brand-logo {
        width: 100px;
    }

    .auth-brand-subtitle {
        display: none;
    }
}

@media (max-width: 575.98px) {
    .auth-topbar-inner {
        flex-direction: column;
        align-items: flex-start;
    }

    .auth-topbar-actions {
        width: 100%;
        justify-content: space-between;
    }

    .auth-theme-button,
    .auth-home-link {
        flex: 1 1 calc(50% - 0.375rem);
        font-size: 0.9rem;
        padding: 0 0.8rem;
    }
}
</style>