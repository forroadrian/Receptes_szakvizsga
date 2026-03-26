<script setup lang="ts">
import { computed } from 'vue';

const route = useRoute();

const isLoginPage = computed(() => route.path === '/login');

const authPanelContent = computed(() => {
    if (route.path === '/register') {
        return {
            badge: 'Új fiók',
            title: 'Kezdjük együtt!',
            text: 'Hozz létre fiókot, mentsd el kedvenc receptjeidet, és tedd személyesebbé az élményt már az első pillanattól.'
        };
    }

    if (route.path === '/forgot-password') {
        return {
            badge: 'Segítség',
            title: 'Visszajutás a fiókodba',
            text: 'Néhány egyszerű lépésben új jelszót kérhetsz, hogy gyorsan és biztonságosan folytathasd az oldalon.'
        };
    }

    if (route.path === '/password-reset') {
        return {
            badge: 'Új jelszó',
            title: 'Már majdnem kész',
            text: 'Állíts be egy új jelszót, és máris folytathatod a böngészést, mentést és tervezést.'
        };
    }

    return {
        badge: 'Bejelentkezés',
        title: 'Üdv újra!',
        text: 'Lépj be, és folytasd ott, ahol abbahagytad: kedvencek, menütervezés és személyes beállítások egy helyen.'
    };
});
</script>

<template>
    <div class="appLayouts herobg auth-layout-shell">
        <AuthHeaderComponent />

        <main class="authLayoutMain">
            <section class="auth-stage">
                <div class="auth-switch-card" :class="isLoginPage ? 'mode-login' : 'mode-register'">
                    <div class="auth-image-pane" aria-hidden="true">
                        <img src="/images/background.webp" alt="" />

                        <div class="auth-image-overlay"></div>

                        <div class="auth-image-content">
                            <span class="auth-image-badge">{{ authPanelContent.badge }}</span>
                            <h2>{{ authPanelContent.title }}</h2>
                            <p>{{ authPanelContent.text }}</p>
                        </div>
                    </div>

                    <div class="auth-content-pane">
                        <div :key="route.path" class="auth-slot-pane">
                            <slot />
                        </div>
                    </div>
                </div>
            </section>
        </main>
    </div>
</template>

<style scoped>
.appLayouts {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.auth-layout-shell {
    position: relative;
    overflow: hidden;
}

.authLayoutMain {
    flex: 1;
    display: flex;
}

.auth-stage {
    width: 100%;
    min-height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.25rem 1rem 1.5rem;
}

.auth-switch-card {
    position: relative;
    width: 100%;
    max-width: 1080px;
    min-height: 720px;
    overflow: hidden;
    border-radius: var(--radius-md);
    border: 1px solid rgba(255, 255, 255, 0.45);
    background: rgba(255, 255, 255, 0.78);
    backdrop-filter: blur(14px);
    box-shadow: 0 20px 44px rgba(0, 0, 0, 0.12);
}

.auth-image-pane {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 50%;
    left: 50%;
    overflow: hidden;
    transition: left 0.6s ease-in-out;
    z-index: 2;
}

.auth-image-pane img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scale(1.02);
}

.auth-image-overlay {
    position: absolute;
    inset: 0;
    background:
        linear-gradient(180deg, rgba(0, 0, 0, 0.10), rgba(0, 0, 0, 0.64)),
        linear-gradient(135deg, rgba(255, 114, 49, 0.14), rgba(53, 165, 90, 0.18));
}

.auth-image-content {
    position: absolute;
    inset: auto 0 0 0;
    z-index: 1;
    padding: 2.4rem;
    display: grid;
    gap: 0.95rem;
    color: var(--text-light);
}

.auth-image-badge {
    width: fit-content;
    padding: 0.45rem 0.9rem;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.24);
    background: rgba(255, 255, 255, 0.14);
    backdrop-filter: blur(8px);
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.02em;
}

.auth-image-content h2 {
    margin: 0;
    font-size: clamp(2.7rem, 3vw, 3.9rem);
    line-height: 1;
    color: var(--text-light);
}

.auth-image-content p {
    max-width: 420px;
    margin: 0;
    font-size: 1rem;
    line-height: 1.75;
    color: rgba(255, 255, 255, 0.92);
}

.auth-content-pane {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 50%;
    height: 100%;
    transition: left 0.6s ease-in-out;
    z-index: 1;
}

.mode-register .auth-content-pane {
    left: 0;
}

.mode-register .auth-image-pane {
    left: 50%;
}

.mode-login .auth-content-pane {
    left: 50%;
}

.mode-login .auth-image-pane {
    left: 0;
}

.auth-slot-pane {
    min-height: 720px;
    display: flex;
    align-items: stretch;
    justify-content: center;
}

[data-bs-theme="dark"] .auth-switch-card {
    border-color: rgba(255, 255, 255, 0.08);
    background: rgba(33, 33, 33, 0.80);
    box-shadow: 0 20px 44px rgba(0, 0, 0, 0.28);
}

@media (max-width: 991.98px) {
    .auth-stage {
        padding: 0.75rem;
        align-items: stretch;
    }

    .auth-switch-card {
        min-height: auto;
        border-radius: 22px;
    }

    .auth-image-pane {
        display: none;
    }

    .auth-content-pane,
    .mode-register .auth-content-pane,
    .mode-login .auth-content-pane {
        position: relative;
        left: 0;
        width: 100%;
        min-height: auto;
        height: auto;
        transform: none;
    }

    .auth-slot-pane {
        min-height: auto;
    }
}

@media (max-width: 575.98px) {
    .auth-stage {
        padding: 0.5rem;
    }
}
</style>