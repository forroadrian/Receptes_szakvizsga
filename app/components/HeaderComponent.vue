<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted } from "vue";
import GradSwitch from "~/components/Switch.vue";
import { useAuthStore } from "~/stores/auth";

const authStore = useAuthStore()
const user = useSupabaseUser();
const route = useRoute();

const isLoggedIn = computed(() => !!user.value);
const colorMode = useColorMode()

const isReady = ref(false)
const dropdownOpen = ref(false)

const lockScroll = () => {
    if (typeof document === 'undefined') return;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
};

const unlockScroll = () => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
};

watch(dropdownOpen, (isOpen) => {
    if (window.innerWidth >= 992) return;
    isOpen ? lockScroll() : unlockScroll();
});


watch(route, () => {
    dropdownOpen.value = false;
    unlockScroll();
});

onUnmounted(() => unlockScroll());

onMounted(async () => {
    isReady.value = true
    await authStore.initializeProfile()
})

watch(
    () => user.value?.id,
    async (newUserId) => {
        if (newUserId) {
            await authStore.loadProfileData(newUserId)
        } else {
            authStore.clearProfileData()
        }
    }
)

const displayProfileImage = computed(() => authStore.profileUrl || '')
const hasProfileImage = computed(() => !!authStore.profileUrl)

const displayUsername = computed(() => {
    if (!user.value) return ""

    if (authStore.username && authStore.username.trim() !== "") {
        return authStore.username
    }

    const metaUsername = user.value.user_metadata?.username
    if (metaUsername && metaUsername.trim() !== "") {
        return metaUsername
    }

    if (user.value.email) {
        return user.value.email.split("@")[0]
    }

    return "Felhasználó"
})

const displayEmail = computed(() => {
    return user.value?.email ?? ""
})

const toggleTheme = () => {
    colorMode.preference =
        colorMode.value === "dark" ? "light" : "dark"
}

const handleSignOut = async () => {
    dropdownOpen.value = false
    const success = await authStore.signOut()

    if (success) {
        await navigateTo("/")
    }
}
</script>

<template>
    <Teleport to="body">
        <Transition name="backdrop-fade">
            <div v-if="dropdownOpen" class="dropdown-backdrop" @click="dropdownOpen = false" />
        </Transition>
    </Teleport>

    <header class="site-header">
        <nav class="navbar navbar-expand-xl" :aria-label="$t('header.nav.aria.main')">
            <div class="container d-flex align-items-center">
                <NuxtLink class="navbar-brand m-0" to="/" :aria-label="$t('common.pages.index')">
                    <NuxtImg src="/logo.png" alt="Menu Planr logo" title="Brand logo" :width="180" :height="128"
                        format="webp" loading="lazy" densities="x1 x2" class="brand-logo" />
                </NuxtLink>

                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav"
                    aria-controls="mainNav" aria-expanded="false" :aria-label="$t('header.nav.collapse.aria.label')">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div id="mainNav" class="collapse navbar-collapse p-0">
                    <ul class="navbar-nav mx-lg-auto nav-links">
                        <li class="nav-item">
                            <NuxtLink class="nav-link" to="/">{{ $t('common.pages.index') }}</NuxtLink>
                        </li>
                        <li class="nav-item">
                            <NuxtLink class="nav-link" to="/recipes">{{ $t('common.pages.recipes') }}</NuxtLink>
                        </li>
                        <li class="nav-item">
                            <NuxtLink class="nav-link" to="/ingredients">{{ $t('common.pages.ingredients') }}</NuxtLink>
                        </li>
                        <li class="nav-item">
                            <NuxtLink class="nav-link" to="/menu">{{ $t('common.pages.menuPlanner') }}</NuxtLink>
                        </li>
                    </ul>

                    <div v-if="!isLoggedIn" class="auth-area">
                        <LanguageSwitcher />
                        <GradSwitch :model-value="isReady && colorMode.value === 'dark'"
                            :icon="isReady && colorMode.value === 'dark' ? 'bi bi-moon-stars-fill' : 'bi bi-sun-fill'"
                            class="pe-lg-4 d-flex justify-content-center" @update:model-value="toggleTheme" />
                        <div class=" d-flex gap-3 auth-buttons">
                           <Button to="/register" color="orange" :outline="true" class="register w-lg-auto">
                            {{ $t('header.nav.register') }}
                        </Button>
                        <Button to="/login" color="orange" class="login w-lg-auto">
                            {{ $t('header.nav.login') }}
                        </Button>      
                        </div>
                           
                    </div>

                    <div v-else class="auth-area">
                        <LanguageSwitcher />

                        <div class="dropdown w-lg-auto mx-auto" data-bs-auto-close="outside">
                            <button class="btn dropdown-toggle d-flex align-items-center gap-2" id="userDropdown"
                                type="button" data-bs-toggle="dropdown" aria-expanded="false"
                                @click="dropdownOpen = !dropdownOpen">
                                <p>
                                    <img v-if="hasProfileImage" :src="displayProfileImage"
                                        :alt="$t('header.nav.profile.image.alt')"
                                        :title="$t('header.nav.profile.image.title')" />
                                    <AvatarInitials v-else :name="displayUsername" size="30px" />
                                </p>

                                <div class="d-flex flex-column align-items-start">
                                    <p class="text-truncate usernameToggle">{{ displayUsername }}</p>
                                </div>
                            </button>

                            <ul class="dropdown-menu account-menu" aria-labelledby="userDropdown">
                                <li class="p-2 text-center">
                                    <div class="account-avatar-wrap mb-3">
                                        <NuxtLink to="/profile">
                                            <img v-if="hasProfileImage" :src="displayProfileImage"
                                                :alt="$t('header.nav.profile.image.alt')"
                                                :title="$t('header.nav.profile.image.title')" />
                                            <AvatarInitials v-else :name="displayUsername" size="55px" />
                                            <span class="account-edit" aria-hidden="true">✎</span>
                                        </NuxtLink>
                                    </div>
                                    <div class="d-flex align-items-center gap-2">
                                        <div class="flex-grow-1">
                                            <p class="fw-bold text-truncate m-0">{{ displayUsername }}</p>
                                            <p class="text-muted small">{{ displayEmail }}</p>
                                        </div>
                                    </div>
                                </li>

                                <li class="px-2">
                                    <div class="d-flex align-items-center justify-content-between rounded-2 px-2 py-2 border"
                                        @click.stop>
                                        <GradSwitch :model-value="isReady && colorMode.value === 'dark'"
                                            :label="isReady && colorMode.value === 'dark' ? $t('header.nav.profile.theme.dark') : $t('header.nav.profile.theme.light')"
                                            :icon="isReady && colorMode.value === 'dark' ? 'bi bi-moon-stars-fill' : 'bi bi-sun-fill'"
                                            @update:model-value="toggleTheme" />
                                    </div>
                                </li>

                                <li class="mt-2">
                                    <NuxtLink to="/profile" class="dropdown-item d-flex align-items-center gap-2 py-2">
                                        <p><span class="badge">👤</span>{{ $t('header.nav.profile.settings') }}</p>
                                    </NuxtLink>
                                </li>

                                <li class="p-2">
                                    <button class="dropdown-item rounded-3 d-flex align-items-center gap-2 py-2"
                                        type="button" @click="handleSignOut">
                                        <span class="fw-semibold text-orange">
                                            <i class="bi bi-box-arrow-right"></i>
                                            {{ $t('header.nav.profile.logout') }}
                                        </span>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    </header>

</template>

<style scoped>
.dropdown-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1029;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(6px);
}

.backdrop-fade-enter-active,
.backdrop-fade-leave-active {
    transition: opacity 0.25s ease;
}

.backdrop-fade-enter-from,
.backdrop-fade-leave-to {
    opacity: 0;
}

.dropdown-item:active,
.dropdown-menu li a:active {
    background-color: var(--yellow) !important;
}

.dropdown button,
.dropdown-menu {
    border: none !important;
}

.nav-link,
.account-avatar-wrap,
.lang-dropdown,
.user-dropdown {
    position: relative;
}

.dropdown button p {
    color: var(--orange);
    margin: 0 auto;
}

.nav-link {
    font-size: var(--base-font-size);
    transition: 0.18s;
}

.nav-link::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    width: 0;
    height: 2px;
    background: var(--grad-orange);
    transition: width 0.5s ease;
}

.account-avatar-wrap img,
.nav-link:hover::after {
    width: 100%;
}

.nav-link.router-link-exact-active {
    font-weight: 600;
}

.navbar-brand img {
    width: var(--brand-logo-width);
    height: auto;
}

.account-avatar-wrap img {
    height: 100%;
    display: block;
    object-fit: cover;
}

.auth-area {
    display: flex;
    flex-direction: column;
}

.nav-avatar,
.account-avatar,
.account-avatar-wrap img,
.account-avatar-wrap,
#userDropdown img,
.account-edit {
    border-radius: var(--radius-rounded);
}

.lang-dropdown .dropdown-menu {
    min-width: 100%;
}

.usernameToggle {
    max-width: 190px;
}

#userDropdown img,
.nav-avatar {
    width: 30px;
    height: 30px;
    object-fit: cover;
    display: block;
}

.dropdown-menu,
.account-menu {
    opacity: 0;
    transform: translateY(-8px);
    visibility: hidden;
    pointer-events: none;
    transition: opacity 0.22s ease, transform 0.22s ease, visibility 0.22s ease;
}

.dropdown-menu.show,
.account-menu.show {
    opacity: 1;
    transform: translateY(0);
    visibility: visible;
    pointer-events: auto;
}

.lang-menu {
    left: 0;
    right: auto;
}

.account-menu {
    top: 120% !important;
    right: 0;
    left: auto;
    min-width: 300px;
    padding: 30px 10px;
    border-radius: var(--radius-md) !important;
    border: 1px solid var(--bs-border-color) !important;
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5), 0 4px 16px rgba(0, 0, 0, 0.10) !important;
    z-index: 1030;
}

.account-avatar-wrap {
    width: 55px;
    height: 55px;
    margin: 0 auto;
    overflow: visible;
}

.account-edit {
    position: absolute;
    right: -6px;
    bottom: -6px;
    width: 26px;
    height: 26px;
    background: var(--text-light);
    color: #6b6b6b;
    border: 1px solid #d9d9d9;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.account-edit,
.nav-links {
    text-align: center;
}

.lang-btn {
    border-radius: var(--radius-sm);
}

.lang-btn:hover,
.flag-icon {
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
}

[data-bs-theme="dark"] .account-edit {
    background: var(--bs-body-bg);
    color: var(--text-light);
    border-color: var(--bs-border-color);
}

@media (min-width: 1200px) {
    .dropdown-backdrop {
        display: none;
    }

    .auth-area {
        width: auto;
        margin-top: 0;
        margin-left: auto;
        flex-direction: row;
        align-items: center;
    }

    .nav-links {
        width: 100%;
        justify-content: space-evenly;
    }

    .lang-btn,
    #userDropdown {
        width: auto;
        justify-content: flex-start;
    }

    .lang-menu {
        min-width: 100%;
        width: max-content;
    }

    .account-menu {
        min-width: 280px;
    }
}

@media (min-width: 768px) {
    .auth-area .register, .auth-area .login {
        width: 60%;
        margin: 0 auto !important;
    }
}

@media (max-width: 1200px) {
    .auth-buttons {
    display: flex;
    flex-direction: column;
}
    .navbar-collapse {
        padding-top: 0.75rem;
    }

    .nav-links .nav-item {
        display: flex;
        justify-content: center;
    }

    .nav-link {
        max-width: 520px;
        margin: 10px 0;
    }

    .auth-area {
        margin-top: 20px;
        padding-top: 20px;
        gap: 20px;
        width: 100%;
    }

    .account-menu {
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        right: auto !important;
        width: min(400px, calc(100vw - 2rem));
        max-height: 85vh;
        overflow-y: auto;
        transform: translate(-50%, -50%) scale(0.95) !important;
        opacity: 0 !important;
        visibility: hidden !important;
    }

    .account-menu.show {
        transform: translate(-50%, -50%) scale(1) !important;
        opacity: 1 !important;
        visibility: visible !important;
    }

    .navbar-brand img {
        width: var(--small-brand-logo-width);
    }
}
</style>