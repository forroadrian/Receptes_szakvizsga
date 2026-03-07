<script setup>
import { ref } from "vue";

const displayedUsername = ref("Felhasználónév");

const usernameInput = ref("");
const emailInput = ref("");
const passwordInput = ref("");
const newPasswordInput = ref("");

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

const handleSave = () => {
    const isAllEmpty =
        !usernameInput.value.trim() &&
        !emailInput.value.trim() &&
        !passwordInput.value.trim() &&
        !newPasswordInput.value.trim();

    if (isAllEmpty) {
        showAlert("danger", "Nem történt módosítás.");
        return;
    }

    if (usernameInput.value.trim()) {
        displayedUsername.value = usernameInput.value.trim();
    }

    usernameInput.value = "";
    emailInput.value = "";
    passwordInput.value = "";
    newPasswordInput.value = "";

    showAlert("success", "Sikeres módosítás.");
};
</script>

<template>
    <div class="profile-page py-4">
        <div class="alert-container position-fixed top-0 start-50 translate-middle-x mt-3">
            <transition name="alert-slide">
                <div v-if="alertShow" class="custom-alert"
                    :class="alertType === 'success' ? 'alert-success-custom' : 'alert-danger-custom'">
                    <div class="custom-alert-content">
                        <div class="custom-alert-left">
                            <i class="bi"
                                :class="alertType === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'"></i>
                            <span>{{ alertMessage }}</span>
                        </div>

                        <button type="button" class="custom-alert-close" @click="closeAlert" aria-label="Bezárás">
                            <i class="bi bi-x-lg"></i>
                        </button>
                    </div>

                    <div class="custom-alert-timer"></div>
                </div>
            </transition>
        </div>

        <div class="container">
            <div class="profile-shell p-3 p-md-4 rounded-3 shadow">
                <div class="row g-4">
                    <div class="col-12 col-lg-4">
                        <div class="card shadow-sm rounded-3">
                            <div class="card-body p-4">
                                <div class="text-center mb-4">
                                    <div class="avatar-wrap mx-auto mb-3 position-relative">
                                        <div
                                            class="avatar-circle d-flex align-items-center justify-content-center bg-light border">
                                            <i class="bi bi-image"></i>
                                        </div>
                                        <button class="avatar-camera" type="button" aria-label="Profilkép módosítása">
                                            <i class="bi bi-camera-fill"></i>
                                        </button>
                                    </div>
                                    <h5 class="mb-0">{{ displayedUsername }}</h5>
                                </div>

                                <div class="mb-4">
                                    <h6 class="mb-2">Nem kedvelt alapanyagok</h6>
                                    <div class="d-flex flex-wrap gap-2">
                                        <span
                                            class="badge rounded-pill text-bg-dark px-3 py-2 d-inline-flex align-items-center gap-2">
                                            Nyúlhús
                                            <button type="button" class="chip-btn" aria-label="Nyúlhús törlése">
                                                <i class="bi bi-x"></i>
                                            </button>
                                        </span>
                                        <span
                                            class="badge rounded-pill text-bg-dark px-3 py-2 d-inline-flex align-items-center gap-2">
                                            Brokkoli
                                            <button type="button" class="chip-btn" aria-label="Brokkoli törlése">
                                                <i class="bi bi-x"></i>
                                            </button>
                                        </span>
                                        <span
                                            class="badge rounded-pill text-bg-dark px-3 py-2 d-inline-flex align-items-center gap-2">
                                            Máj
                                            <button type="button" class="chip-btn" aria-label="Máj törlése">
                                                <i class="bi bi-x"></i>
                                            </button>
                                        </span>
                                    </div>
                                </div>
                                <div class="mb-4">
                                    <h6 class="mb-2">Allergének</h6>

                                    <div class="d-flex flex-wrap gap-2">
                                        <span
                                            class="badge rounded-pill text-bg-dark px-3 py-2 d-inline-flex align-items-center gap-2">
                                            Laktóz
                                            <button type="button" class="chip-btn" aria-label="Laktóz törlése">
                                                <i class="bi bi-x"></i>
                                            </button>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="mt-4">
                            <div class="list-group menu">
                                <button type="button"
                                    class="list-group-item list-group-item-action active d-flex align-items-center gap-2">
                                    <i class="bi bi-person-lines-fill "></i>
                                    <span>Profil beállítások</span>
                                </button>

                                <button type="button"
                                    class="list-group-item list-group-item-action d-flex align-items-center gap-2">
                                    <i class="bi bi-shield-plus"></i>
                                    <span>Allergén hozzáadása</span>
                                </button>

                                <button type="button"
                                    class="list-group-item list-group-item-action d-flex align-items-center gap-2">
                                    <i class="bi bi-slash-circle"></i>
                                    <span>Nem kedvelt alapanyagok hozzáadása</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-lg-8">
                        <div class="card shadow-sm rounded-3">
                            <div class="card-body p-4 p-md-5">
                                <div class="section-title mb-4 pb-3">
                                    <h2 class="mb-0">Profil beállítások</h2>
                                </div>
                                <form @submit.prevent="handleSave">
                                    <div class="mb-3">
                                        <FormInput v-model="usernameInput" label="Felhasználónév" type="text"
                                            placeholder="Felhasználónév" />
                                    </div>
                                    <div class="mb-3">
                                        <FormInput v-model="emailInput" label="Email" type="email" required
                                            placeholder="Email" />
                                    </div>
                                    <div class="mb-3">
                                        <FormInput v-model="passwordInput" label="Jelszó" type="password"
                                            placeholder="Jelszó" />
                                    </div>
                                    <div class="mb-4">
                                        <FormInput v-model="newPasswordInput" label="Új jelszó" type="password"
                                            placeholder="Új jelszó" />
                                    </div>
                                    <div class="d-flex flex-column flex-sm-row gap-3 justify-content-end">

                                        <Button type="button" color="dark" class="btn-lg px-5 rounded-pill"
                                            @click="handleSave">
                                            Mentés
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.profile-shell {
    background: var(--bs-body-bg);
}

.alert-container {
    min-width: 320px;
    max-width: 90vw;
    z-index: 1080;
}

.custom-alert {
    min-width: 320px;
    max-width: 460px;
    border-radius: 16px;
    backdrop-filter: blur(10px);
    box-shadow: 0 14px 35px rgba(0, 0, 0, 0.18);
    border: 1px solid rgba(255, 255, 255, 0.10);
}

.custom-alert-content,
.custom-alert-left {
    display: flex;
    align-items: center;
}

.custom-alert-content {
    justify-content: space-between;
    gap: 18px;
    padding: 14px 16px;
}

.custom-alert-left {
    gap: 10px;
    font-weight: 500;
}

.custom-alert-left i {
    font-size: 1.1rem;
}

.custom-alert-close,
.chip-btn {
    border: 0;
    background: transparent;
    color: inherit;
    padding: 0;
    display: inline-flex;
    align-items: center;
}

.custom-alert-close {
    opacity: 0.85;
    justify-content: center;
    cursor: pointer;
    transition: opacity .2s ease, transform .2s ease;
}

.custom-alert-close:hover {
    opacity: 1;
    transform: scale(1.08);
}

.custom-alert-timer {
    height: 4px;
    width: 100%;
    transform-origin: left;
    animation: alertTimerBar 5s linear forwards;
}

.alert-success-custom,
.alert-danger-custom {
    color: #fff;
}

.alert-success-custom {
    background: rgba(25, 135, 84, 0.96);
}

.alert-danger-custom {
    background: rgba(220, 53, 69, 0.96);
}

.alert-success-custom .custom-alert-timer,
.alert-danger-custom .custom-alert-timer {
    background: rgba(255, 255, 255, 0.85);
}

.alert-slide-enter-active,
.alert-slide-leave-active {
    transition: opacity 0.35s ease, transform 0.35s ease;
}

.alert-slide-enter-from {
    opacity: 0;
    transform: translateY(-20px) scale(0.96);
}

.alert-slide-enter-to,
.alert-slide-leave-from {
    opacity: 1;
    transform: translateY(0) scale(1);
}

.alert-slide-leave-to {
    opacity: 0;
    transform: translateY(-14px) scale(0.98);
}

@keyframes alertTimerBar {
    from {
        transform: scaleX(1);
    }

    to {
        transform: scaleX(0);
    }
}

.section-title {
    position: relative;
}

.section-title::after,
.menu .list-group-item.active::before {
    content: "";
    background: linear-gradient(180deg, rgba(214, 188, 142, .95), rgba(193, 154, 107, .95));
}

.section-title::after {
    position: absolute;
    left: 0;
    bottom: -1px;
    width: 120px;
    height: 3px;
    border-radius: 999px;
}

.avatar-wrap,
.avatar-circle {
    width: 140px;
    height: 140px;
}

.avatar-circle {
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
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 18px rgba(0, 0, 0, 0.18);
}

.profile-shell .card {
    background: var(--bs-body-bg);
    color: var(--bs-emphasis-color);
}

.profile-shell .row.g-4> :last-child .card {
    border: none;
    position: relative;
}

.profile-shell .row.g-4> :last-child .card::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 70px;
    background: linear-gradient(180deg, rgba(214, 188, 142, .25), rgba(255, 255, 255, 0));
}

.menu .list-group-item {
    border: 0;
    border-radius: 0;
    margin-bottom: 10px;
    padding: 12px 14px 12px 52px;
    background: transparent;
    color: var(--bs-emphasis-color);
    position: relative;
    transition: background-color .2s ease, transform .2s ease;
}

.menu .list-group-item i {
    position: absolute;
    left: 22px;
    top: 50%;
    transform: translateY(-50%);
    opacity: .85;
}

.menu .list-group-item::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    border-radius: 999px;
    background: transparent;
}

.menu .list-group-item:hover {
    background: rgba(214, 188, 142, .15);
}

.menu .list-group-item.active {
    background: rgba(214, 188, 142, .25);
    box-shadow: 0 6px 18px rgba(0, 0, 0, .06);
}

.menu .list-group-item:active {
    transform: translateY(1px);
}

[data-bs-theme="dark"] .profile-shell {
    background: rgba(15, 18, 22, 0.65);
}

[data-bs-theme="dark"] .profile-shell,
[data-bs-theme="dark"] .profile-shell .card {
    border: 1px solid rgba(255, 255, 255, 0.10);
}

[data-bs-theme="dark"] .profile-shell .card {
    background: rgba(20, 24, 29, 0.92);
}

[data-bs-theme="dark"] .profile-shell .card,
[data-bs-theme="dark"] .section-title h2,
[data-bs-theme="dark"] h5,
[data-bs-theme="dark"] h6,
[data-bs-theme="dark"] :deep(.form-control) {
    color: var(--bs-emphasis-color);
}

[data-bs-theme="dark"] .menu .list-group-item:hover {
    background: rgba(214, 188, 142, .12);
}

[data-bs-theme="dark"] .menu .list-group-item.active {
    background: rgba(214, 188, 142, .22);
    box-shadow: 0 10px 26px rgba(0, 0, 0, .35);
}

[data-bs-theme="dark"] .avatar-circle.bg-light {
    background: rgba(255, 255, 255, 0.10) !important;
    border-color: rgba(255, 255, 255, 0.18) !important;
}

[data-bs-theme="dark"] .avatar-circle i {
    color: rgba(255, 255, 255, 0.75);
}

[data-bs-theme="dark"] .profile-shell .row.g-4> :last-child .card::before {
    background: linear-gradient(180deg, rgba(214, 188, 142, .18), rgba(0, 0, 0, 0));
}

[data-bs-theme="dark"] :deep(.form-control) {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.16);
}

[data-bs-theme="dark"] :deep(.form-control::placeholder) {
    color: rgba(255, 255, 255, 0.55);
}

[data-bs-theme="dark"] :deep(.password-icon) {
    color: rgba(255, 255, 255, 0.70);
}

[data-bs-theme="dark"] :deep(.btn-outline-dark),
[data-bs-theme="dark"] :deep(.btn-outline-dark:link),
[data-bs-theme="dark"] :deep(.btn-outline-dark:visited),
[data-bs-theme="dark"] :deep(.btn-outline-dark *),
[data-bs-theme="dark"] :deep(.btn-dark) {
    color: var(--bs-emphasis-color) !important;
}

[data-bs-theme="dark"] :deep(.btn-outline-dark),
[data-bs-theme="dark"] :deep(.btn-outline-dark:link),
[data-bs-theme="dark"] :deep(.btn-outline-dark:visited) {
    border-color: rgba(255, 255, 255, 0.28) !important;
    background: transparent !important;
}

[data-bs-theme="dark"] :deep(.btn-outline-dark:hover),
[data-bs-theme="dark"] :deep(.btn-outline-dark:focus),
[data-bs-theme="dark"] :deep(.btn-outline-dark:active) {
    color: rgba(255, 255, 255, 0.96) !important;
    border-color: rgba(255, 255, 255, 0.42) !important;
    background: rgba(255, 255, 255, 0.08) !important;
}

[data-bs-theme="dark"] :deep(.btn-dark) {
    background: rgba(255, 255, 255, 0.14) !important;
    border-color: rgba(255, 255, 255, 0.12) !important;
}

[data-bs-theme="dark"] :deep(.btn-dark:hover) {
    background: rgba(255, 255, 255, 0.20) !important;
}

[data-bs-theme="dark"] .badge.text-bg-dark {
    background: rgba(255, 255, 255, 0.10) !important;
    color: rgba(255, 255, 255, 0.90) !important;
}

[data-bs-theme="dark"] .chip-btn {
    color: rgba(255, 255, 255, 0.85) !important;
}
</style>