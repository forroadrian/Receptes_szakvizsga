<script setup lang="ts">
import { computed } from 'vue';

const route = useRoute();

const isLoginPage = computed(() => route.path === '/login');
</script>

<template>
    <div class="appLayouts herobg">
        <HeaderComponent />

        <main class="authLayoutMain">
            <section class="auth-stage">
                <div class="auth-switch-card" :class="isLoginPage ? 'mode-login' : 'mode-register'">
                    <div class="auth-image-pane" aria-hidden="true">
                        <img src="/images/background.webp" alt="recipe image" title="recipe image" />
                    </div>

                    <div class="auth-content-pane">
                        <div :key="route.path" class="auth-slot-pane">
                            <slot />
                        </div>
                    </div>
                </div>
            </section>
        </main>

        <FooterComponent />
    </div>
</template>

<style scoped>
.appLayouts {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
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
    padding: 1.25rem 1rem;
}

.auth-switch-card {
    position: relative;
    width: 100%;
    max-width: 1080px;
    min-height: 720px;
    border-radius: var(--radius-sm);
    border: 2px solid var(--border-soft);
    background: var(--white);
    box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.12);
}

.auth-image-pane {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 50%;
    left: 50%;
    transition: left 0.6s ease-in-out;
    z-index: 2;
}

.auth-image-pane img {
    width: 100%;
    height: 100%;
    object-fit: cover;
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
    height: 640px;
    display: flex;
    align-items: stretch;
    justify-content: center;
}

@media (max-width: 991.98px) {
    .auth-stage {
        padding: 0;
    }

    .auth-switch-card {
        min-height: 100vh;
        height: auto;
        border-radius: 0;
        border-left: none;
        border-right: none;
    }

    .auth-image-pane {
        display: none;
    }

    .auth-content-pane,
    .mode-register .auth-content-pane,
    .mode-login .auth-content-pane {
        left: 0;
        width: 100%;
        min-height: 100vh;
        height: auto;
        transform: none;
    }

    .auth-slot-pane {
        min-height: 100vh;
        height: auto;
    }
}
</style>