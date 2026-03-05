<script setup></script>

<template>
    <div class="profile-page py-4">
        <div class="container">
            <div class="profile-shell p-3 p-md-4 rounded-4 shadow">
                <div class="row g-4">
                    <div class="col-12 col-lg-4">
                        <div class="card shadow-sm rounded-4">
                            <div class="card-body p-4">
                                <div class="text-center mb-4">
                                    <div class="avatar-wrap mx-auto mb-3 position-relative">
                                        <div
                                            class="avatar-circle d-flex align-items-center justify-content-center bg-light border">
                                            <i class="bi bi-image fs-2 text-secondary"></i>
                                        </div>
                                        <span class="camera-badge badge bg-dark position-absolute rounded-pill">
                                            <i class="bi bi-camera text-white"></i>
                                        </span>
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
                                    <i class="bi bi-person-lines-fill"></i>
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
                        <div class="card shadow-sm rounded-4">
                            <div class="card-body p-4 p-md-5">
                                <div class="section-title mb-4 pb-3">
                                    <h2 class="h3 mb-0">Profil beállítások</h2>
                                </div>
                                <form>
                                    <div class="mb-3">
                                        <FormInput label="Felhasználónév" type="text"
                                            placeholder="Felhasználónév" />
                                    </div>
                                    <div class="mb-3">
                                        <FormInput label="Email" type="email" required
                                            placeholder="Email" />
                                    </div>
                                    <div class="mb-3">
                                        <FormInput label="Jelszó" type="password"
                                            placeholder="Jelszó" />
                                    </div>
                                    <div class="mb-4">
                                        <FormInput label="Új jelszó" type="password"
                                            placeholder="Új jelszó" />
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
    background: #ffffff;
}

.section-title {
    border-bottom: 1px solid rgba(0, 0, 0, .12);
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

.camera-badge {
    bottom: 10px;
    right: 10px;
    padding: 8px;
}

.menu .list-group-item {
    border: 0;
    border-radius: 14px;
    margin-bottom: 10px;
    padding: 12px 14px;
    background: transparent;
}

.menu .list-group-item {
    color: #000;
}

.chip-btn {
    border: 0;
    background: transparent;
    color: inherit;
    padding: 0;
    display: inline-flex;
    align-items: center;
}
</style>