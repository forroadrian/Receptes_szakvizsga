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
            <div class="container px-0 d-flex align-items-center">
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

                    <form v-else class="auth-area">
                        <select class="form-select lang-select m-auto" v-model="selectedLanguage"
                            aria-label="Nyelv választása">
                            <option v-for="lang in languageOptions" :value="lang.value">
                                {{ lang.label }}
                            </option>
                        </select>

                        <div class="dropdown w-lg-auto">
                            <button
                                class="dropdown-toggle d-flex align-items-center justify-content-center justify-content-lg-start"
                                type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <img class="nav-avatar me-3" src="../assets/images/logo.png" alt="Profilkép" />
                                <p class="text-truncate my-auto">HosszúFelhasználónév </p>
                            </button>

                            <ul class="dropdown-menu account-menu">
                                <li class="account-head p-3">
                                    <div class="account-avatar-wrap">
                                        <img class="account-avatar" src="../assets/images/logo.png" alt="Profilkép" />
                                        <span class="account-edit" aria-hidden="true">✎</span>
                                    </div>
                                    <div class="mt-2 text-center">
                                        <div class="account-name "><strong>felhasznalonev</strong></div>
                                        <p class="account-email">felhasznalo.gmail.com</p>
                                    </div>
                                </li>
                                <li>
                                    <div class="form-check form-switch m-2" @click.stop>
                                        <input class="form-check-input bg-danger" type="checkbox" role="switch"
                                            v-model="isLight" />
                                        <span>{{ isLight ? "Világos téma" : "Sötét téma" }}</span>
                                    </div>
                                </li>
                                <li>
                                    <NuxtLink to="about" class="dropdown-item account-item" href="#">
                                        <span><i class="bi bi-gear pe-3"></i>Profil beállítások</span>
                                    </NuxtLink>
                                </li>
                                <li>
                                    <a class="dropdown-item account-item" href="#">
                                        <span><i class="bi bi-box-arrow-right pe-3"></i>Kijelentkezés</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </form>
                </div>
            </div>
        </nav>
    </header>

</template>

<style scoped>
.dropdown button {
    border: none !important;
    background-color: transparent !important;
}

.site-header,
.nav-link:hover::after,
.lang-select,
.auth-area,
.dropdown, 
.grad {
    width: 100%;
}

.nav-link,
.account-avatar-wrap {
    position: relative;
}

.dropdown button p {
    color: var(--orange);
}

.nav-link {
    font-size: var(--nav-font-size);
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
}

.auth-area {
    display: flex;
    flex-direction: column;
    gap: 30px;
    margin-top: 30px;
}

.nav-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    flex: 0 0 auto;
}

.dropdown-menu {
    min-width: 100%;
}

.navbar,
.container-fluid,
.navbar-collapse {
    max-width: 100%;
}

.account-menu,
.account-edit {
    background: #fafafa;
}

.account-menu {
    border: 0;
    color: #1b1b1b;
}

.account-avatar-wrap {
    width: 56px;
    height: 56px;
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


.account-item {
    padding: 10px;
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
        width: 40%;
        max-width: 520px;
        margin: 10px 0px;
    }

}
</style>