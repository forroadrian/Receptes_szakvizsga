<script setup></script>

<template>
    <div class="profile-page py-4">
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
                                    <h5 class="mb-0">Felhasználónév</h5>
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
                                <form>
                                    <div class="mb-3">
                                        <FormInput label="Felhasználónév" type="text" placeholder="Felhasználónév" />
                                    </div>
                                    <div class="mb-3">
                                        <FormInput label="Email" type="email" required placeholder="Email" />
                                    </div>
                                    <div class="mb-3">
                                        <FormInput label="Jelszó" type="password" placeholder="Jelszó" />
                                    </div>
                                    <div class="mb-4">
                                        <FormInput label="Új jelszó" type="password" placeholder="Új jelszó" />
                                    </div>
                                    <div class="d-flex flex-column flex-sm-row gap-3 justify-content-end">
                                        <Button type="button" outline color="dark" class="btn-lg px-5 rounded-pill">
                                            Mégsem
                                        </Button>
                                        <Button type="button" color="dark" class="btn-lg px-5 rounded-pill">
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

.section-title {
    position: relative;
}

.section-title::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -1px;
    width: 120px;
    height: 3px;
    border-radius: 999px;
    background: linear-gradient(180deg, rgba(214, 188, 142, .95), rgba(193, 154, 107, .95));
}

.avatar-wrap {
    width: 140px;
    height: 140px;
}

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

.menu .list-group-item.active::before {
    background: linear-gradient(180deg, rgba(214, 188, 142, .95), rgba(193, 154, 107, .95));
}

.menu .list-group-item:active {
    transform: translateY(1px);
}

.chip-btn {
    border: 0;
    background: transparent;
    color: inherit;
    padding: 0;
    display: inline-flex;
    align-items: center;
}

[data-bs-theme="dark"] .profile-shell {
    background: rgba(15, 18, 22, 0.65);
    border: 1px solid rgba(255, 255, 255, 0.10);
}

[data-bs-theme="dark"] .profile-shell .card {
    background: rgba(20, 24, 29, 0.92);
    border: 1px solid rgba(255, 255, 255, 0.10);
    color: var(--bs-emphasis-color);
}

[data-bs-theme="dark"] .section-title h2,
[data-bs-theme="dark"] h5,
[data-bs-theme="dark"] h6 {
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
    color: var(--bs-emphasis-color);
}

[data-bs-theme="dark"] :deep(.form-control::placeholder) {
    color: rgba(255, 255, 255, 0.55);
}

[data-bs-theme="dark"] :deep(.password-icon) {
    color: rgba(255, 255, 255, 0.70);
}

[data-bs-theme="dark"] :deep(.btn-outline-dark),
[data-bs-theme="dark"] :deep(.btn-outline-dark:link),
[data-bs-theme="dark"] :deep(.btn-outline-dark:visited) {
    color: var(--bs-emphasis-color) !important;
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

[data-bs-theme="dark"] :deep(.btn-outline-dark *),
[data-bs-theme="dark"] :deep(.btn-outline-dark span) {
    color: var(--bs-emphasis-color) !important;
}

[data-bs-theme="dark"] :deep(.btn-dark) {
    background: rgba(255, 255, 255, 0.14) !important;
    border-color: rgba(255, 255, 255, 0.12) !important;
    color: var(--bs-emphasis-color) !important;
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

[data-bs-theme="dark"] .grad {
    color: rgba(255, 255, 255, 0.85) !important;
}
</style>