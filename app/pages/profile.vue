<script setup>
import { ref } from "vue";

const displayedUsername = ref("Felhasználónév");

const usernameInput = ref(displayedUsername.value);
const currentPasswordInput = ref("");
const newPasswordInput = ref("");
const confirmPasswordInput = ref("");
const emailInput = ref("");
const newEmailInput = ref("");

const activeSection = ref("menu");

const alertShow = ref(false);
const alertType = ref("success");
const alertMessage = ref("");

let alertTimer;

const closeAlert = () => {
    clearTimeout(alertTimer);
    alertShow.value = false;
};

const showAlert = (type, message) => {
    clearTimeout(alertTimer);
    alertType.value = type;
    alertMessage.value = message;
    alertShow.value = false;

    setTimeout(() => {
        alertShow.value = true;
    }, 10);

    alertTimer = setTimeout(() => {
        alertShow.value = false;
    }, 5000);
};

const resetToMenu = () => {
    activeSection.value = "menu";
    usernameInput.value = displayedUsername.value;
    currentPasswordInput.value = "";
    newPasswordInput.value = "";
    confirmPasswordInput.value = "";
    newEmailInput.value = "";
};

const openSection = (section) => {
    activeSection.value = section;

    if (section === "username") {
        usernameInput.value = displayedUsername.value;
    }

    if (section === "email") {
        newEmailInput.value = "";
    }

    if (section === "password") {
        currentPasswordInput.value = "";
        newPasswordInput.value = "";
        confirmPasswordInput.value = "";
    }
};

const handleSave = () => {
    if (activeSection.value === "username") {
        if (!usernameInput.value.trim()) {
            showAlert("danger", "Add meg a felhasználónevet.");
            return;
        }

        displayedUsername.value = usernameInput.value.trim();
        usernameInput.value = displayedUsername.value;
        showAlert("success", "Sikeres módosítás.");
        resetToMenu();
        return;
    }

    if (activeSection.value === "email") {
        if (!emailInput.value.trim() || !newEmailInput.value.trim()) {
            showAlert("danger", "Töltsd ki mindkét email mezőt.");
            return;
        }

        emailInput.value = newEmailInput.value.trim();
        newEmailInput.value = "";
        showAlert("success", "Sikeres módosítás.");
        resetToMenu();
        return;
    }

    if (activeSection.value === "password") {
        if (
            !currentPasswordInput.value.trim() ||
            !newPasswordInput.value.trim() ||
            !confirmPasswordInput.value.trim()
        ) {
            showAlert("danger", "Töltsd ki az összes jelszó mezőt.");
            return;
        }

        if (newPasswordInput.value !== confirmPasswordInput.value) {
            showAlert("danger", "Az új jelszavak nem egyeznek.");
            return;
        }

        currentPasswordInput.value = "";
        newPasswordInput.value = "";
        confirmPasswordInput.value = "";
        showAlert("success", "Sikeres módosítás.");
        resetToMenu();
    }
};
</script>

<template>
    <div class="profile-page py-4">
        <Alert :show="alertShow" :type="alertType" :message="alertMessage" @close="closeAlert"
        />

        <div class="container">
            <div class="profile-shell p-3 p-md-4 rounded-3 shadow w-100">
                <div class="row g-4">
                    <div class="col-12 col-lg-4">
                        <div class="card shadow-sm rounded-3">
                            <div class="card-body p-4">
                                <div class="text-center mb-4">
                                    <div class="avatar-wrap mx-auto mb-3 position-relative">
                                        <div class="avatar-circle d-flex align-items-center justify-content-center border">
                                            <i class="bi bi-image"></i>
                                        </div>
                                        <button class="avatar-camera" type="button">
                                            <i class="bi bi-camera-fill"></i>
                                        </button>
                                    </div>
                                    <h5 class="mb-0">{{ displayedUsername }}</h5>
                                </div>

                                <div class="mb-4">
                                    <h6 class="mb-2">Nem kedvelt alapanyagok</h6>
                                    <div class="d-flex flex-wrap gap-2">
                                        <span class="badge rounded-pill text-bg-dark px-3 py-2 d-inline-flex align-items-center gap-2">
                                            Nyúlhús
                                            <button type="button" class="chip-btn">
                                                <i class="bi bi-x"></i>
                                            </button>
                                        </span>
                                        <span class="badge rounded-pill text-bg-dark px-3 py-2 d-inline-flex align-items-center gap-2">
                                            Brokkoli
                                            <button type="button" class="chip-btn">
                                                <i class="bi bi-x"></i>
                                            </button>
                                        </span>
                                        <span class="badge rounded-pill text-bg-dark px-3 py-2 d-inline-flex align-items-center gap-2">
                                            Máj
                                            <button type="button" class="chip-btn">
                                                <i class="bi bi-x"></i>
                                            </button>
                                        </span>
                                    </div>
                                </div>

                                <div class="mb-4">
                                    <h6 class="mb-2">Allergének</h6>

                                    <div class="d-flex flex-wrap gap-2">
                                        <span class="badge rounded-pill text-bg-dark px-3 py-2 d-inline-flex align-items-center gap-2">
                                            Laktóz
                                            <button type="button" class="chip-btn">
                                                <i class="bi bi-x"></i>
                                            </button>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="mt-4">
                            <div class="list-group menu">
                                <button type="button" class="list-group-item list-group-item-action active d-flex align-items-center gap-2" @click="resetToMenu">
                                    <i class="bi bi-person-lines-fill"></i>
                                    <span>Profil beállítások</span>
                                </button>

                                <button type="button" class="list-group-item list-group-item-action d-flex align-items-center gap-2">
                                    <i class="bi bi-shield-plus"></i>
                                    <span>Allergén hozzáadása</span>
                                </button>

                                <button type="button" class="list-group-item list-group-item-action d-flex align-items-center gap-2">
                                    <i class="bi bi-slash-circle"></i>
                                    <span>Nem kedvelt alapanyagok hozzáadása</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="col-12 col-lg-8 d-flex">
                        <div class="card custshadow rounded-3 w-100 right-card">
                            <div class="card-body p-4 p-md-5 h-100 d-flex flex-column">
                                <section v-if="activeSection === 'menu'">
                                    <div class="section-title mb-4 pb-3">
                                        <h2 class="mb-0">Profil beállítások</h2>
                                    </div>

                                    <div class="settings-options">
                                        <button type="button" class="settings-option" @click="openSection('username')">
                                            <div class="settings-option-left">
                                                <i class="bi bi-person"></i>
                                                <div>
                                                    <h5 class="mb-1">Felhasználónév módosítás</h5>
                                                </div>
                                            </div>
                                            <i class="bi bi-chevron-right"></i>
                                        </button>

                                        <button type="button" class="settings-option" @click="openSection('password')">
                                            <div class="settings-option-left">
                                                <i class="bi bi-lock"></i>
                                                <div>
                                                    <h5 class="mb-1">Jelszó módosítás</h5>
                                                </div>
                                            </div>
                                            <i class="bi bi-chevron-right"></i>
                                        </button>

                                        <button type="button" class="settings-option" @click="openSection('email')">
                                            <div class="settings-option-left">
                                                <i class="bi bi-envelope"></i>
                                                <div>
                                                    <h5 class="mb-1">Email módosítás</h5>
                                                </div>
                                            </div>
                                            <i class="bi bi-chevron-right"></i>
                                        </button>
                                    </div>
                                </section>

                                <section v-if="activeSection === 'username'">
                                    <div class="section-title mb-4 pb-3">
                                        <h2 class="mb-0">Felhasználónév módosítása</h2>
                                    </div>

                                    <form class="d-flex flex-column flex-grow-1" @submit.prevent="handleSave">
                                        <div class="mb-4">
                                            <FormInput v-model="usernameInput" label="Felhasználónév" type="text" />
                                        </div>

                                        <div class="mt-auto d-flex flex-column flex-sm-row gap-3 justify-content-end">
                                            <Button type="button" color="outline-dark" class="btn-lg px-5 rounded-pill" @click="resetToMenu">
                                                Mégsem
                                            </Button>

                                            <Button type="button" color="dark" class="btn-lg px-5 rounded-pill" @click="handleSave">
                                                Mentés
                                            </Button>
                                        </div>
                                    </form>
                                </section>

                                <section v-if="activeSection === 'password'">
                                    <div class="section-title mb-4 pb-3">
                                        <h2 class="mb-0">Jelszó módosítása</h2>
                                    </div>

                                    <form class="d-flex flex-column flex-grow-1" @submit.prevent="handleSave">
                                        <div class="mb-3">
                                            <FormInput v-model="currentPasswordInput" label="Aktuális jelszó" type="password" />
                                        </div>

                                        <div class="mb-3">
                                            <FormInput v-model="newPasswordInput" label="Új jelszó" type="password" />
                                        </div>

                                        <div class="mb-4">
                                            <FormInput v-model="confirmPasswordInput" label="Add meg újra a jelszavad" type="password" />
                                        </div>

                                        <div class="mt-auto d-flex flex-column flex-sm-row gap-3 justify-content-end">
                                            <Button type="button" color="outline-dark" class="btn-lg px-5 rounded-pill" @click="resetToMenu">
                                                Mégsem
                                            </Button>

                                            <Button type="button" color="dark" class="btn-lg px-5 rounded-pill" @click="handleSave">
                                                Mentés
                                            </Button>
                                        </div>
                                    </form>
                                </section>

                                <section v-if="activeSection === 'email'">
                                    <div class="section-title mb-4 pb-3">
                                        <h2 class="mb-0">Email módosítása</h2>
                                    </div>

                                    <form class="d-flex flex-column flex-grow-1" @submit.prevent="handleSave">
                                        <div class="mb-3">
                                            <FormInput v-model="emailInput" label="Email" type="email"/>
                                        </div>

                                        <div class="mb-4">
                                            <FormInput v-model="newEmailInput" label="Új email" type="email"/>
                                        </div>

                                        <div class="mt-auto d-flex flex-column flex-sm-row gap-3 justify-content-end">
                                            <Button type="button" color="outline-dark" class="btn-lg px-5 rounded-pill" @click="resetToMenu">
                                                Mégsem
                                            </Button>

                                            <Button type="button" color="dark" class="btn-lg px-5 rounded-pill" @click="handleSave">
                                                Mentés
                                            </Button>
                                        </div>
                                    </form>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.chip-btn {
    border: 0;
    background: transparent;
    color: inherit;
    padding: 0;
    display: inline-flex;
    align-items: center;
}

.profile-page {
    min-height: calc(100vh - 120px);
}

.section-title {
    position: relative;
}

:deep(.form-control:focus) {
    border-color: rgba(214, 188, 142, 0.95);
    box-shadow: 0 0 0 0.2rem rgba(214, 188, 142, 0.25);
}

.section-title::after,
.menu .list-group-item.active::before {
    content: "";
    background: linear-gradient(180deg, rgba(214, 188, 142, .95), rgba(193, 154, 107, .95));
}

.section-title::after {
    position: absolute;
    bottom: 0;
    width: 180px;
    height: 5px;
    border-radius: 50%;
}

.avatar-wrap,
.avatar-circle {
    width: 140px;
    height: 140px;
    border-radius: 100%;
}

.avatar-camera {
    position: absolute;
    right: -8px;
    bottom: 4px;
    width: 38px;
    height: 38px;
    border: none;
    border-radius: 50%;
    background: var(--grad-dark);
    color: #fff;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 18px rgba(0, 0, 0, 0.18);
}

.profile-shell .row.g-4> :last-child .card {
    border: none;
}

.profile-shell .row.g-4> :last-child .card::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 15%;
    background: linear-gradient(180deg, rgba(214, 188, 142, .25), rgba(255, 255, 255, 0));
}

.menu .list-group-item {
    border: 0;
    border-radius: 0;
    margin-bottom: 10px;
    padding: 12px 14px 12px 52px;
    color: var(--bs-emphasis-color);
    transition: background-color .2s ease, transform .2s ease;
}

.menu .list-group-item i {
    position: absolute;
    left: 22px;
    top: 50%;
    transform: translateY(-50%);
}

.menu .list-group-item::before {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    border-radius: 10%;
}

.menu .list-group-item:hover {
    background: rgba(214, 188, 142, .15);
}

.menu .list-group-item.active {
    background: rgba(214, 188, 142, .30);
    box-shadow: 0 6px 18px rgba(0, 0, 0, .10);
}

.menu .list-group-item:active {
    transform: translateY(3px);
}

.settings-options {
    border: 2px solid rgba(0, 0, 0, 0.10);
    border-radius: 16px;
}

.settings-option {
    width: 100%;
    border: 0;
    border-bottom: 2px solid rgba(0, 0, 0, 0.10);
    background: transparent;
    padding: 24px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.settings-option:last-child {
    border-bottom: none;
}

.settings-option:hover {
    background: rgba(214, 188, 142, .15);
}

.settings-option-left {
    display: flex;
    align-items: center;
    gap: 16px;
}

.custshadow {
    box-shadow: rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
}

.settings-option-left i {
    font-size: 1.3rem;
}

.settings-option h5 {
    font-size: 1.1rem;
}

[data-bs-theme="dark"] .profile-shell {
    background: rgba(15, 18, 22, 0.65);
}

[data-bs-theme="dark"] .profile-shell .card {
    background: rgba(20, 24, 29, 0.92);
}
</style>