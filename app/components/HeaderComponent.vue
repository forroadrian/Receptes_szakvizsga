<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useAuthStore } from "~/stores/auth";

const authStore = useAuthStore()
const user = useSupabaseUser()

const isLoggedIn = computed(() => !!user.value);
const selectedLanguage = ref("hu");
const colorMode = useColorMode()

const languageOptions = [
    { value: "hu", label: "Magyar" },
    { value: "en", label: "English" }
]

const isReady = ref(false)
onMounted(() => {
    isReady.value = true
})

const ingredientsNavTo = computed(() => {
    return user.value ? "/ingredients" : "/login"
});

const displayProfileImage = computed(() => {
    return '/icons/profile.png'
})

const displayUsername = computed(() => {
    if (!user.value) return ""

    const username = user.value.user_metadata?.username
    if (username && username.trim() !== "") {
        return username
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
    const success = await authStore.signOut()

    if (success) {
        await navigateTo("/")
    }
}
</script>
<template>
    <header class="site-header">
        <nav class="navbar navbar-expand-lg" aria-label="Fő navigáció">
            <div class="container d-flex align-items-center">
                <NuxtLink class="navbar-brand m-0" to="/" aria-label="Kezdőlap">
                    <img src="/logo.webp" alt="Brand logo" title="Brand logo" class="brand-logo" />
                </NuxtLink>

                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav"
                    aria-controls="mainNav" aria-expanded="false" aria-label="Menü megnyitása">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div id="mainNav" class="collapse navbar-collapse p-0">
                    <ul class="navbar-nav mx-lg-auto nav-links">
                        <li class="nav-item">
                            <NuxtLink class="nav-link" to="/">Kezdőlap</NuxtLink>
                        </li>
                        <li class="nav-item">
                            <NuxtLink class="nav-link" to="/recipes">Receptek</NuxtLink>
                        </li>
                        <li class="nav-item">
                            <NuxtLink class="nav-link" :to="ingredientsNavTo">Alapanyagok</NuxtLink>
                        </li>
                        <li class="nav-item">
                            <NuxtLink class="nav-link" to="/menuPlanner">Menütervező</NuxtLink>
                        </li>
                    </ul>

                    <div v-if="!isLoggedIn" class="auth-area">
                        <p @click="toggleTheme" class="baseMode d-flex m-0  justify-content-center pe-lg-4">
                            {{ isReady && colorMode.value === "dark" ? "🌙" : "☀️" }}
                            <span class="my-auto ms-1">
                                {{ isReady && colorMode.value === "dark" ? "Sötét téma" : "Világos téma" }}
                            </span>
                        </p>
                        <NuxtLink class="w-lg-auto me-3 grad orange" to="/register"> Regisztráció</NuxtLink>
                        <NuxtLink class="grad orange w-lg-auto  me-3" to="/login">Belépés</NuxtLink>
                    </div>

                    <div v-else class="auth-area">
                        <div class="dropdown lang-dropdown mx-auto">
                            <button class="btn lang-btn dropdown-toggle d-flex align-items-center gap-2" type="button"
                                data-bs-toggle="dropdown">
                                <img :src="selectedLanguage === 'hu' ? '/icons/hu.svg' : '/icons/gb.svg'"
                                    class=" flag-icon" width="22" height="16" alt="flag" />

                                <span class="fw-semibold">
                                    {{ selectedLanguage === 'hu' ? 'Magyar' : 'English' }}
                                </span>
                            </button>

                            <ul class="dropdown-menu rounded-4 shadow-sm">
                                <li v-for="lang in languageOptions" :key="lang.value">
                                    <span class="dropdown-item lang-item d-flex align-items-center gap-2 rounded-3"
                                        @click="selectedLanguage = lang.value">
                                        <img :src="lang.value === 'hu'
                                            ? '/icons/hu.svg' : '/icons/gb.svg'" class=" flag-icon" alt="flag" />
                                        <span>{{ lang.label }}</span>
                                    </span>
                                </li>
                            </ul>
                        </div>

                        <div class="dropdown w-lg-auto mx-auto" data-bs-auto-close="outside">
                            <button class="btn dropdown-toggle d-flex align-items-center gap-2" id="userDropdown"
                                type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <p><img :src="displayProfileImage" alt="Profilkép" title="Profilkép" /></p>

                                <div class="d-flex flex-column align-items-start">
                                    <p class="text-truncate usernameToggle">{{ displayUsername }}</p>
                                </div>
                            </button>

                            <ul class="dropdown-menu account-menu shadow" aria-labelledby="userDropdown">
                                <li class="p-2 text-center">
                                    <div class="account-avatar-wrap mb-3">
                                        <img :src="displayProfileImage" alt="Profilkép" title="Profilkép" />
                                        <span class="account-edit" aria-hidden="true">✎</span>
                                    </div>
                                    <div class="d-flex align-items-center gap-2">
                                        <div class="flex-grow-1">
                                            <p class="fw-bold text-truncate m-0">{{ displayUsername }}</p>
                                            <p class="text-muted small">
                                                {{ displayEmail }}
                                            </p>
                                        </div>
                                    </div>
                                </li>

                                <li class="px-2">
                                    <div class="d-flex align-items-center justify-content-between rounded-2 px-2 py-2 border"
                                        @click.stop>
                                        <div class="d-flex align-items-center">
                                            <span class="badge">
                                                {{ isReady && colorMode.value === "dark" ? "🌙" : "☀️" }}
                                            </span>
                                            {{ isReady && colorMode.value === "dark" ? "Sötét téma" : "Világos téma" }}
                                        </div>
                                        <div class="form-check form-switch">
                                            <input class="form-check-input border-0 ms-auto" type="checkbox"
                                                role="switch" :checked="isReady && colorMode.value === 'dark'"
                                                @change="toggleTheme" />
                                        </div>
                                    </div>
                                </li>

                                <li class="mt-2">
                                    <NuxtLink to="/profile" class="dropdown-item d-flex align-items-center gap-2 py-2 ">
                                        <p><span class="badge">👤</span>Profil beállítások</p>
                                    </NuxtLink>
                                </li>

                                <li class="p-2">
                                    <button class="dropdown-item rounded-3 d-flex align-items-center gap-2 py-2 "
                                        type="button" @click="handleSignOut">
                                        <span class="fw-semibold text-orange"><i class="bi bi-box-arrow-right"></i>
                                            Kijelentkezés</span>
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

.nav-link,
.baseMode span {
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

.nav-link:hover::after, .account-avatar-wrap img {
    width: 100%;
}

.nav-link.router-link-exact-active {
    font-weight: 700;
    color: var(--dark);
}

.navbar-brand img {
    width: var(--brand-logo-width);
    height: auto;
}

.account-avatar-wrap img {
    object-fit: contain;
}

.auth-area {
    display: flex;
    flex-direction: column;
}

.nav-avatar,
.account-avatar {
    border-radius: var(--radius-rounded);
}

.lang-dropdown .dropdown-menu {
    min-width: 100%;
}

.usernameToggle {
    max-width: 190px;
}

.form-switch input {
    background-color: var(--yellow) !important;
}

.form-switch input:checked {
    background-color: var(--orange) !important;
}

.form-switch input:focus {
    box-shadow: none !important;
}

#userDropdown img,
.nav-avatar {
    width: 30px;
    height: 30px;
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
    right: 0;
    left: auto;
    margin-left: 0;
}

.account-avatar-wrap {
    width: 55px;
    height: 55px;
    margin: 0 auto;
}

.account-avatar {
    object-fit: cover;
}

.account-edit {
    position: absolute;
    right: -10px;
    bottom: -10px;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    font-size: 20px;
}

.account-edit,
.nav-links {
    text-align: center;
}

.flag-icon {
    width: 22px;
    height: 16px;
    object-fit: cover;
    border-radius: 4px;
}

.lang-btn {
    border-radius: var(--radius-sm);
}

.lang-btn:hover,  .flag-icon {
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
}

.baseMode {
    font-size: var(--nav-icon-size);
    cursor: pointer;
}

@media (min-width: 992px) {
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

    .baseMode span {
        display: none;
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
        min-width: 250px;
    }
}

@media (max-width: 991.98px) {
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
    }

    .account-menu {
        min-width: 300px;
    }

    .account-menu {
        right: -70%;
    }

}
</style>