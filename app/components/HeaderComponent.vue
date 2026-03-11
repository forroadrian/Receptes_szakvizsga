<script setup lang="ts">
import { ref, onMounted } from "vue";

const isLoggedIn = ref(true);
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

const toggleTheme = () => {
    colorMode.preference =
        colorMode.value === "dark" ? "light" : "dark"
}

</script>
<template>
    <header class="site-header">
        <nav class="navbar navbar-expand-lg" aria-label="Fő navigáció">
            <div class="container d-flex align-items-center">
                <NuxtLink class="navbar-brand m-0" to="/" aria-label="Kezdőlap">
                    <img src="/logo.png" alt="Brand logo" title="Brand logo" class="brand-logo" />
                </NuxtLink>

                <button class="navbar-toggler ms-auto" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav"
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
                            <NuxtLink class="nav-link" to="/ingredients">Alapanyagok</NuxtLink>
                        </li>
                        <li class="nav-item">
                            <NuxtLink class="nav-link" to="/menuPlanner">Menütervező</NuxtLink>
                        </li>
                    </ul>

                    <div v-if="!isLoggedIn" class="auth-area">
                        <NuxtLink class="grad orange outline w-lg-auto" to="/signup"> Regisztráció</NuxtLink>
                        <NuxtLink class="grad orange w-lg-auto" to="/login">Belépés</NuxtLink>
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
                                <li v-for="lang in languageOptions">
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
                                <div> <img src="/logo.png" alt="Profilkép" /></div>

                                <div class="d-flex flex-column align-items-start">
                                    <p class="text-truncate usernameToggle">HosszúFelhasználónév</p>
                                </div>
                            </button>

                            <ul class="dropdown-menu account-menu shadow" aria-labelledby="userDropdown">
                                <li class="p-2 text-center">
                                    <div class="account-avatar-wrap mb-3">
                                        <img class="account-avatar" src="/logo.png" alt="Profilkép" />
                                        <span class="account-edit" aria-hidden="true">✎</span>
                                    </div>
                                    <div class="d-flex align-items-center gap-2">
                                        <div class="flex-grow-1">
                                            <p class="fw-bold text-truncate m-0">felhasznalonev</p>
                                            <p class="text-muted small text-break">
                                                hosszufelhasznalonev<br>@bankitatabanya.hu </p>
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
                                    <button class="dropdown-item rounded-3d-flex align-items-center gap-2 py-2 "
                                        type="button">
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

.nav-link:hover::after {
    width: 100%;
}

.nav-link,
.account-avatar-wrap {
    position: relative;
}

.dropdown button p {
    color: var(--orange);
    margin: 0px auto;
}

.nav-link {
    font-size: 18px;
    transition: .18s;
}

.nav-link::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    width: 0;
    height: 2px;
    background: var(--grad-orange);
    transition: width .5s ease;
}

.nav-link.router-link-exact-active {
    font-weight: 700;
    color: var(--dark)
}

.navbar-brand img {
    width: var(--brand-logo-width);
    height: auto;
}

.auth-area {
    display: flex;
    flex-direction: column;
}

.nav-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    flex: 0 auto;
}

.lang-dropdown .dropdown-menu {
    min-width: 100%;
    width: auto;
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
    box-shadow: none !important
}

#userDropdown img {
    width: 30px;
    height: 30px;
}


.dropdown-menu,
.account-menu {
    display: block;
    opacity: 0;
    transform: translateY(-8px);
    visibility: hidden;
    pointer-events: none;
    transition: opacity .22s ease, transform .22s ease, visibility .22s ease;
}

.account-menu {
    min-width: 250px;
    margin-left: 10px;
}

.dropdown-menu.show,
.account-menu.show {
    opacity: 1;
    transform: translateY(0);
    visibility: visible;
    pointer-events: auto;
}

.account-avatar-wrap {
    width: 55px;
    height: 55px;
    margin: 0 auto;
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
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.lang-btn {
    border-radius: 14px;
}

.lang-btn:hover {
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
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

    .lang-select {
        width: 140px;
    }
}

@media (max-width: 992px) {
    .lang-select {
        width: 50%;
        text-align: center;
    }

    .navbar-collapse {
        padding-top: .75rem;
    }

    .nav-links .nav-item {
        display: flex;
        justify-content: center;
    }

    .nav-link {
        max-width: 520px;
        margin: 10px 0px;
    }

    .auth-area {
        margin-top: 20px;
        padding-top: 20px;
        gap: 20px;
    }
}
</style>