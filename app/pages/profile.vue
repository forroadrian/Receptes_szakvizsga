<script setup>
definePageMeta({
    middleware: 'auth-only'
});

import { computed, ref, watch } from "vue";
import { useAuthStore } from "~/stores/auth";

const auth = useAuthStore()
const supabase = useSupabaseClient()

const { showAlert } = useAlert()

const displayedUsername = ref('');
const usernameInput = ref('');
const currentPasswordInput = ref("");
const newPasswordInput = ref("");
const confirmPasswordInput = ref("");
const emailInput = ref("");
const newEmailInput = ref("");
const allergenInput = ref("");
const dislikedIngredientInput = ref("");

const allergens = ref([]);
const dislikedIngredients = ref([]);

const activeSection = ref("menu");

const usernameOk = computed(() => usernameInput.value.trim().length >= 4);
const newPasswordOk = computed(() => newPasswordInput.value.length >= 6);

const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

watch(
    () => auth.user,
    async (newUser) => {
        const userId = newUser?.id || newUser?.sub

        if (!userId) return

        const { data } = await supabase
            .from('user')
            .select('username, email')
            .eq('id', userId)
            .single()

        if (data) {
            displayedUsername.value = data.username
            usernameInput.value = data.username
        }

        if (newUser?.email && data?.email !== newUser.email) {
            const { error } = await supabase
                .from('user')
                .update({ email: newUser.email })
                .eq('id', userId)

            if (error) {
                console.warn("Nem sikerült szinkronizálni az email címet a user táblába.", error)
            }
        }
    },
    { immediate: true }
)

const isProfileSettingsActive = computed(() =>
    ["menu", "username", "password", "email"].includes(activeSection.value)
);

const resetToMenu = () => {
    activeSection.value = "menu";
    usernameInput.value = displayedUsername.value;
    currentPasswordInput.value = "";
    newPasswordInput.value = "";
    confirmPasswordInput.value = "";
    emailInput.value = "";
    newEmailInput.value = "";
    allergenInput.value = "";
    dislikedIngredientInput.value = "";
};

const openSection = (section) => {
    activeSection.value = section;

    if (section === "username") {
        usernameInput.value = displayedUsername.value;
    }

    if (section === "email") {
        emailInput.value = "";
        newEmailInput.value = "";
    }

    if (section === "password") {
        currentPasswordInput.value = "";
        newPasswordInput.value = "";
        confirmPasswordInput.value = "";
    }

    if (section === "allergen") {
        allergenInput.value = "";
    }

    if (section === "dislikedIngredient") {
        dislikedIngredientInput.value = "";
    }
};

const removeAllergen = (index) => {
    allergens.value.splice(index, 1);
    showAlert("success", "Allergén sikeresen törölve.");
};

const removeDislikedIngredient = (index) => {
    dislikedIngredients.value.splice(index, 1);
    showAlert("success", "A nem kedvelt alapanyag sikeresen törölve.");
};

const handleSave = async () => {
    if (activeSection.value === "username") {
        const trimmedUsername = usernameInput.value.trim();

        if (!trimmedUsername) {
            showAlert("danger", "Add meg a felhasználónevet.");
            return;
        }

        if (!usernameOk.value) {
            showAlert("danger", "A felhasználónév legalább 4 karakter legyen.");
            return;
        }

        if (trimmedUsername === displayedUsername.value.trim()) {
            showAlert("danger", "Az új felhasználónév megegyezik a régivel.");
            return;
        }

        const success = await auth.updateUsername(trimmedUsername)

        if (!success) {
            showAlert("danger", auth.errorMessage || "Hiba történt mentéskor.");
            return;
        }

        displayedUsername.value = trimmedUsername;
        usernameInput.value = trimmedUsername;
        showAlert("success", "Sikeres módosítás.");
        resetToMenu();
        return;
    }

    if (activeSection.value === "email") {
        const currentEmail = emailInput.value.trim().toLowerCase();
        const newEmail = newEmailInput.value.trim().toLowerCase();

        if (!currentEmail || !newEmail) {
            showAlert("danger", "Töltsd ki mindkét email mezőt.");
            return;
        }

        if (!isValidEmail(currentEmail) || !isValidEmail(newEmail)) {
            showAlert("danger", "Adj meg érvényes email címet.");
            return;
        }

        if (currentEmail === newEmail) {
            showAlert("danger", "Az új email cím megegyezik a régivel.");
            return;
        }

        const success = await auth.updateEmail(currentEmail, newEmail)

        if (!success) {
            showAlert("danger", auth.errorMessage || "Hiba történt mentéskor.");
            return;
        }

        emailInput.value = "";
        newEmailInput.value = "";
        showAlert("success", "Megerősítő email elküldve. Nézd meg az új és a régi email címedet is. Az email címed a jóváhagyás után frissül."); resetToMenu();
        resetToMenu();
        return;
    }

    if (activeSection.value === "password") {
        if (
            !currentPasswordInput.value ||
            !newPasswordInput.value ||
            !confirmPasswordInput.value
        ) {
            showAlert("danger", "Töltsd ki az összes jelszó mezőt.");
            return;
        }

        if (!newPasswordOk.value) {
            showAlert("danger", "Az új jelszó legalább 6 karakter legyen.");
            return;
        }

        if (currentPasswordInput.value === newPasswordInput.value) {
            showAlert("danger", "Az új jelszó nem egyezhet meg a régivel.");
            return;
        }

        if (newPasswordInput.value !== confirmPasswordInput.value) {
            showAlert("danger", "Az új jelszavak nem egyeznek.");
            return;
        }

        const success = await auth.updatePassword(
            currentPasswordInput.value,
            newPasswordInput.value
        )

        if (!success) {
            showAlert("danger", auth.errorMessage || "Hiba történt mentéskor.");
            return;
        }

        currentPasswordInput.value = "";
        newPasswordInput.value = "";
        confirmPasswordInput.value = "";
        showAlert("success", "Sikeres módosítás.");
        resetToMenu();
        return;
    }

    if (activeSection.value === "allergen") {
        const trimmedAllergen = allergenInput.value.trim();

        if (!trimmedAllergen) {
            showAlert("danger", "Add meg az allergén nevét.");
            return;
        }

        if (allergens.value.some((item) => item.toLowerCase() === trimmedAllergen.toLowerCase())) {
            showAlert("danger", "Ez az allergén már szerepel a listában.");
            return;
        }

        allergens.value.push(trimmedAllergen);
        showAlert("success", "Allergén sikeresen hozzáadva.");
        resetToMenu();
        return;
    }

    if (activeSection.value === "dislikedIngredient") {
        const trimmedIngredient = dislikedIngredientInput.value.trim();

        if (!trimmedIngredient) {
            showAlert("danger", "Add meg a nem kedvelt alapanyag nevét.");
            return;
        }

        if (dislikedIngredients.value.some((item) => item.toLowerCase() === trimmedIngredient.toLowerCase())) {
            showAlert("danger", "Ez az alapanyag már szerepel a listában.");
            return;
        }

        dislikedIngredients.value.push(trimmedIngredient);
        showAlert("success", "A nem kedvelt alapanyag sikeresen hozzáadva.");
        resetToMenu();
    }
};
</script>

<template>
    <div class="profile-page py-4">
        <div class="container">
            <div class="profile-shell p-3 p-md-4 rounded-3 shadow w-100">
                <div class="row g-4">
                    <div class="col-12 col-lg-4">
                        <div class="shadow-sm rounded-3">
                            <div class="card-body shadow-sm p-4">
                                <div class="text-center mb-4">
                                    <div class="avatar-wrap mx-auto mb-3 position-relative">
                                        <div class="avatar-circle d-flex align-items-center justify-content-center">
                                            <img src="/icons/profile.png" alt="Profile" title="Profile picture">
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
                                        <span v-for="(ingredient, index) in dislikedIngredients"
                                            :key="`${ingredient}-${index}`"
                                            class="badge rounded-pill text-bg-dark px-3 py-2 d-inline-flex align-items-center gap-2">
                                            {{ ingredient }}
                                            <button type="button" class="chip-btn"
                                                @click="removeDislikedIngredient(index)">
                                                <i class="bi bi-x"></i>
                                            </button>
                                        </span>
                                    </div>
                                </div>

                                <div class="mb-4">
                                    <h6 class="mb-2">Allergének</h6>
                                    <div class="d-flex flex-wrap gap-2">
                                        <span v-for="(allergen, index) in allergens" :key="`${allergen}-${index}`"
                                            class="badge rounded-pill text-bg-dark px-3 py-2 d-inline-flex align-items-center gap-2">
                                            {{ allergen }}
                                            <button type="button" class="chip-btn" @click="removeAllergen(index)">
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
                                    class="list-group-item list-group-item-action d-flex align-items-center gap-2"
                                    :class="{ active: isProfileSettingsActive }" @click="resetToMenu">
                                    <i class="bi bi-person-lines-fill"></i>
                                    <span>Profil beállítások</span>
                                </button>

                                <button type="button"
                                    class="list-group-item list-group-item-action d-flex align-items-center gap-2"
                                    :class="{ active: activeSection === 'allergen' }" @click="openSection('allergen')">
                                    <i class="bi bi-shield-plus"></i>
                                    <span>Allergén hozzáadása</span>
                                </button>

                                <button type="button"
                                    class="list-group-item list-group-item-action d-flex align-items-center gap-2"
                                    :class="{ active: activeSection === 'dislikedIngredient' }"
                                    @click="openSection('dislikedIngredient')">
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
                                            <Button type="button" color="outline-dark" class="btn-lg px-5 rounded-pill"
                                                @click="resetToMenu">
                                                Mégsem
                                            </Button>

                                            <Button type="button" color="dark" class="btn-lg px-5 rounded-pill"
                                                @click="handleSave">
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
                                            <FormInput v-model="currentPasswordInput" label="Aktuális jelszó"
                                                type="password" />
                                        </div>

                                        <div class="mb-3">
                                            <FormInput v-model="newPasswordInput" label="Új jelszó" type="password" />
                                        </div>

                                        <div class="mb-4">
                                            <FormInput v-model="confirmPasswordInput" label="Add meg újra a jelszavad"
                                                type="password" />
                                        </div>

                                        <div class="mt-auto d-flex flex-column flex-sm-row gap-3 justify-content-end">
                                            <Button type="button" color="outline-dark" class="btn-lg px-5 rounded-pill"
                                                @click="resetToMenu">
                                                Mégsem
                                            </Button>

                                            <Button type="button" color="dark" class="btn-lg px-5 rounded-pill"
                                                @click="handleSave">
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
                                            <FormInput v-model="emailInput" label="Email" type="email" />
                                        </div>

                                        <div class="mb-4">
                                            <FormInput v-model="newEmailInput" label="Új email" type="email" />
                                        </div>

                                        <div class="mt-auto d-flex flex-column flex-sm-row gap-3 justify-content-end">
                                            <Button type="button" color="outline-dark" class="btn-lg px-5 rounded-pill"
                                                @click="resetToMenu">
                                                Mégsem
                                            </Button>

                                            <Button type="button" color="dark" class="btn-lg px-5 rounded-pill"
                                                @click="handleSave">
                                                Mentés
                                            </Button>
                                        </div>
                                    </form>
                                </section>

                                <section v-if="activeSection === 'allergen'">
                                    <div class="section-title mb-4 pb-3">
                                        <h2 class="mb-0">Allergén hozzáadása</h2>
                                    </div>

                                    <form class="d-flex flex-column flex-grow-1" @submit.prevent="handleSave">
                                        <div class="mb-4">
                                            <FormInput v-model="allergenInput" label="Allergén neve" type="text" />
                                        </div>

                                        <div class="mt-auto d-flex flex-column flex-sm-row gap-3 justify-content-end">
                                            <Button type="button" color="outline-dark" class="btn-lg px-5 rounded-pill"
                                                @click="resetToMenu">
                                                Mégsem
                                            </Button>

                                            <Button type="button" color="dark" class="btn-lg px-5 rounded-pill"
                                                @click="handleSave">
                                                Hozzáadás
                                            </Button>
                                        </div>
                                    </form>
                                </section>

                                <section v-if="activeSection === 'dislikedIngredient'">
                                    <div class="section-title mb-4 pb-3">
                                        <h2 class="mb-0">Nem kedvelt alapanyagok hozzáadása</h2>
                                    </div>

                                    <form class="d-flex flex-column flex-grow-1" @submit.prevent="handleSave">
                                        <div class="mb-4">
                                            <FormInput v-model="dislikedIngredientInput"
                                                label="Nem kedvelt alapanyag neve" type="text" />
                                        </div>

                                        <div class="mt-auto d-flex flex-column flex-sm-row gap-3 justify-content-end">
                                            <Button type="button" color="outline-dark" class="btn-lg px-5 rounded-pill"
                                                @click="resetToMenu">
                                                Mégsem
                                            </Button>

                                            <Button type="button" color="dark" class="btn-lg px-5 rounded-pill"
                                                @click="handleSave">
                                                Hozzáadás
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

<style src="~/assets/css/profile.css"></style>