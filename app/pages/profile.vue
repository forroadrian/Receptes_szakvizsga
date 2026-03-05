<script setup></script>

<template>
    <div class="py-3">
        <div class="row g-4">
            <div class="col-lg-4">
                <div class="card p-4 shadow-sm">
                    <div class="text-center mb-4">
                        <div class="avatar-wrap mx-auto mb-3 position-relative">
                            <div class="avatar-circle bg-light border d-flex align-items-center justify-content-center">
                                <i class="bi bi-image fs-2"></i>
                            </div>

                            <span class="camera-badge badge bg-dark position-absolute">
                                <i class="bi bi-camera"></i>
                            </span>
                        </div>
                        <h5>Felhasználónév</h5>
                    </div>

                    <div class="mb-4">
                        <h6>Nem kedvelt alapanyagok</h6>
                        <div class="d-flex flex-wrap gap-2">
                            <span class="badge bg-dark rounded-pill px-3 py-2">
                                Nyúlhús
                            </span>

                            <span class="badge bg-dark rounded-pill px-3 py-2">
                                Brokkoli
                            </span>

                            <span class="badge bg-dark rounded-pill px-3 py-2">
                                Máj
                            </span>
                        </div>
                    </div>

                    <div class="mb-4">
                        <h6>Allergének</h6>
                        <div class="d-flex flex-wrap gap-2">
                            <span class="badge bg-dark rounded-pill px-3 py-2">
                                Laktóz
                            </span>
                        </div>
                    </div>

                    <div class="list-group">
                        <button class="list-group-item list-group-item-action active">
                            Profil beállítások
                        </button>

                        <button class="list-group-item list-group-item-action">
                            Allergén hozzáadása
                        </button>

                        <button class="list-group-item list-group-item-action">
                            Nem kedvelt alapanyagok hozzáadása
                        </button>
                    </div>
                </div>
            </div>

            <div class="col-lg-8">
                <div class="card p-5 shadow-sm">
                    <h2 class="mb-4">Profil beállítások</h2>
                    <form>
                        <FormInput label="Felhasználónév" />
                        <FormInput label="Email" type="email" required />
                        <FormInput label="Jelszó" type="password" />
                        <FormInput label="Új jelszó" type="password" />

                        <div class="d-flex justify-content-end gap-3 mt-4">
                            <Button color="dark" outline>
                                Mégsem
                            </Button>

                            <Button color="orange" type="submit">
                                Mentés
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
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
}
</style>