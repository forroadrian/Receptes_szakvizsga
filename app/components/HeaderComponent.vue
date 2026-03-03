<script setup lang="ts">
import { ref, computed } from "vue";

const isLoggedIn = ref(true);
const selectedLanguage = ref("hu");
const isLight = ref(true);

const languageOptions = [
    { value: "hu", label: "Magyar" },
    { value: "en", label: "English" }
]

const theme = computed(() => (isLight.value ? "dark" : "light"));
const themeText = computed(() => (isLight.value ? "Sötét mód" : "Világos mód"));

</script>
<template>
    <header class="site-header">
        <nav class="navbar navbar-expand-lg" aria-label="Fő navigáció">
            <div class="container d-flex align-items-center">
                <NuxtLink class="navbar-brand m-0" to="/" aria-label="Kezdőlap">
                    <img src="../assets/images/logo.png" alt="Brand logo" title="Brand logo" class="brand-logo" />
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
                                <img :src="selectedLanguage === 'hu' ? '/icons/hu.svg' : '/icons/us.svg'"
                                    class="flag-icon" alt="flag" />

                                <span class="fw-semibold">
                                    {{ selectedLanguage === 'hu' ? 'Magyar' : 'English' }}
                                </span>
                            </button>

                            <ul class="dropdown-menu rounded-4 mx-auto">
                                <li v-for="lang in languageOptions">
                                    <button class="dropdown-item lang-item d-flex align-items-center gap-2 rounded-3"
                                        @click="selectedLanguage = lang.value">
                                        <img :src="lang.value === 'hu'
                                            ? '/icons/hu.svg' : '/icons/us.svg'" class=" flag-icon" alt="flag" />
                                        <span>{{ lang.label }}</span>
                                    </button>
                                </li>
                            </ul>
                        </div>

                        <div class="dropdown w-lg-auto mx-auto" data-bs-auto-close="outside">
                            <button class="btn dropdown-toggle d-flex align-items-center gap-2" id="userDropdown"
                                type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <div> <img src="../assets/images/logo.png" alt="Profilkép" /></div>

                                <div class="d-flex flex-column align-items-start">
                                    <p class="text-truncate usernameToggle">HosszúFelhasználónév</p>
                                </div>
                            </button>

                            <ul class="dropdown-menu account-menu shadow" aria-labelledby="userDropdown">
                                <li class="p-2 text-center">
                                    <div class="account-avatar-wrap mb-3">
                                        <img class="account-avatar" src="../assets/images/logo.png" alt="Profilkép" />
                                        <span class="account-edit" aria-hidden="true">✎</span>
                                    </div>
                                    <div class="d-flex align-items-center gap-2">
                                        <div class="flex-grow-1">
                                            <p class="fw-bold text-truncate m-0">felhasznalonev</p>
                                            <p class="text-muted small text-break">hosszufelhasznalonev<br>@bankitatabanya.hu </p>
                                        </div>
                                    </div>
                                </li>

                                <li class="px-2">
                                    <div class="d-flex align-items-center justify-content-between rounded-2 px-2 py-2 border"@click.stop>
                                        <div class="d-flex align-items-center">
                                            <p>
                                                <span class="badge">{{ isLight ? "☀️" : "🌙" }}</span>
                                                {{ isLight ? "Világos téma" : "Sötét téma" }}
                                            </p>
                                        </div>
                                        <div class="form-check form-switch">
                                            <input class="form-check-input bg-warning border-0 ms-auto" type="checkbox"
                                                role="switch" v-model="isLight" />
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
    color: #7a7a7a;
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
    color: var(--text-dark);
    font-weight: 600;
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
    flex: 0 0 auto;
}

.usernameToggle {
    max-width: 190px;
}

#userDropdown img {
    width: 30px;
    height: 30px;
}

.account-menu,
.account-edit,
.lang-item:hover {
    background: #fafafa;
}

.account-menu.show,
.dropdown-menu.show {
    display: block;
    pointer-events: auto;
}

.account-menu {
    color: #1b1b1b;
    min-width: 250px;
    margin-left: 10px;
}

.dropdown-menu,
.account-menu {
    display: none;
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
    color: #000000;
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
        width: 30%;
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