<script setup>
definePageMeta({
    middleware: 'auth-only'
});

import { storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { usePreferencesStore } from '~/stores/preferences';

const auth = useAuthStore();
const preferences = usePreferencesStore();
const { showAlert } = useAlert();
const {
    validateUsernameChange,
    validateEmailChange,
    validatePasswordChange,
    validateSelectedAllergies,
    validateDislikedIngredient,
} = useProfileValidation();

const { userAllergies, selectedAllergies, saving: preferencesSaving } = storeToRefs(preferences);

const displayedUsername = ref('');
const usernameInput = ref('');
const currentPasswordInput = ref('');
const newPasswordInput = ref('');
const confirmPasswordInput = ref('');
const emailInput = ref('');
const newEmailInput = ref('');
const allergenInput = ref('');
const dislikedIngredientInput = ref('');
const signOutEverywhere = ref(false);
const dislikedIngredients = ref([]);
const activeSection = ref('menu');
const profileImageInput = ref(null);

const currentAuthUserId = computed(() => auth.user?.id || auth.user?.sub || '');
const filteredAllergies = computed(() => preferences.getFilteredAllergies(allergenInput.value));
const hasTypedAllergen = computed(() => allergenInput.value.trim().length > 0);
const isProfileSettingsActive = computed(() => ['menu', 'username', 'password', 'email'].includes(activeSection.value));
const displayProfileImage = computed(() => auth.profileUrl || '/icons/profile.png');

const sidebarItems = [
    {
        key: 'allergen',
        icon: 'bi-shield-plus',
        label: 'Allergének',
    },
    {
        key: 'dislikedIngredient',
        icon: 'bi-slash-circle',
        label: 'Nem kedvelt alapanyagok',
    },
];

const settingsOptions = [
    {
        key: 'username',
        icon: 'bi-person',
        title: 'Felhasználónév módosítás',
    },
    {
        key: 'password',
        icon: 'bi-lock',
        title: 'Jelszó módosítás',
    },
    {
        key: 'email',
        icon: 'bi-envelope',
        title: 'Email módosítás',
    },
];

const sectionResetters = {
    username() {
        usernameInput.value = displayedUsername.value;
    },
    email() {
        emailInput.value = '';
        newEmailInput.value = '';
    },
    password() {
        currentPasswordInput.value = '';
        newPasswordInput.value = '';
        confirmPasswordInput.value = '';
        signOutEverywhere.value = false;
    },
    allergen() {
        allergenInput.value = '';
        preferences.clearSelectedAllergies();
    },
    dislikedIngredient() {
        dislikedIngredientInput.value = '';
    },
};

const resetSection = (section) => {
    sectionResetters[section]?.();
};

const resetAllSections = () => {
    Object.keys(sectionResetters).forEach(resetSection);
};

const resetToMenu = () => {
    resetAllSections();
    activeSection.value = 'menu';
};

const openSection = (section) => {
    activeSection.value = section;
    resetSection(section);
};

const syncProfileData = async (newUser) => {
    const userId = newUser?.id || newUser?.sub;

    if (!userId) {
        displayedUsername.value = '';
        usernameInput.value = '';
        preferences.clearPreferenceState();
        return;
    }

    const data = await auth.loadProfileData();

    if (data) {
        displayedUsername.value = data.username;
        usernameInput.value = data.username;
    }

    const loadAllergyDataSuccess = await preferences.loadAllergyData(userId);

    if (!loadAllergyDataSuccess) {
        showAlert('danger', preferences.errorMessage || 'Nem sikerült betölteni az allergéneket.');
    }
};

watch(() => auth.user, syncProfileData, { immediate: true });

const showError = (message) => {
    showAlert('danger', message);
};

const selectAllergy = (allergy) => {
    const added = preferences.addSelectedAllergy(allergy);

    if (!added) {
        showError('Ez az allergén már szerepel a listában.');
        return;
    }

    allergenInput.value = '';
};

const removeSelectedAllergen = (allergy) => {
    preferences.removeSelectedAllergy(allergy.id);
};

const removeAllergen = async (allergy) => {
    const success = await preferences.deleteUserAllergy(allergy.id, currentAuthUserId.value);

    if (!success) {
        showError(preferences.errorMessage || 'Az allergén törlése nem sikerült.');
        return;
    }

    showAlert('success', 'Allergén sikeresen törölve.');
};

const removeDislikedIngredient = (_, index) => {
    dislikedIngredients.value.splice(index, 1);
    showAlert('success', 'A nem kedvelt alapanyag sikeresen törölve.');
};

const openProfileImagePicker = () => {
    profileImageInput.value?.click();
};

const handleProfileImageChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
        return;
    }

    if (!file.type.startsWith('image/')) {
        showError('Csak képfájlt választhatsz ki.');
        event.target.value = '';
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        showError('A kép mérete legfeljebb 2 MB lehet.');
        event.target.value = '';
        return;
    }

    const success = await auth.updateProfileImage(file);

    if (!success) {
        showError(auth.errorMessage || 'Nem sikerült módosítani a profilképet.');
        event.target.value = '';
        return;
    }

    showAlert('success', 'Sikeres profilkép módosítás.');
    event.target.value = '';
};

const saveUsername = async () => {
    const validationMessage = validateUsernameChange(usernameInput.value, displayedUsername.value);

    if (validationMessage) {
        showError(validationMessage);
        return;
    }

    const trimmedUsername = usernameInput.value.trim();
    const success = await auth.updateUsername(trimmedUsername);

    if (!success) {
        showError(auth.errorMessage || 'Hiba történt mentéskor.');
        return;
    }

    displayedUsername.value = trimmedUsername;
    usernameInput.value = trimmedUsername;
    showAlert('success', 'Sikeres módosítás.');
    resetToMenu();
};

const saveEmail = async () => {
    const validationMessage = validateEmailChange(emailInput.value, newEmailInput.value);

    if (validationMessage) {
        showError(validationMessage);
        return;
    }

    const success = await auth.updateEmail(
        emailInput.value.trim().toLowerCase(),
        newEmailInput.value.trim().toLowerCase(),
    );

    if (!success) {
        showError(auth.errorMessage || 'Hiba történt mentéskor.');
        return;
    }

    showAlert('success', 'Megerősítő email elküldve. Nézd meg az új és a régi email címedet is. Az email címed a jóváhagyás után frissül.');
    resetToMenu();
};

const savePassword = async () => {
    const validationMessage = validatePasswordChange(
        currentPasswordInput.value,
        newPasswordInput.value,
        confirmPasswordInput.value,
    );

    if (validationMessage) {
        showError(validationMessage);
        return;
    }

    const success = await auth.updatePassword(currentPasswordInput.value, newPasswordInput.value);

    if (!success) {
        showError(auth.errorMessage || 'Hiba történt mentéskor.');
        return;
    }

    if (signOutEverywhere.value) {
        const signOutSuccess = await auth.signOut();

        if (!signOutSuccess) {
            showError(auth.errorMessage || 'A kijelentkeztetés nem sikerült.');
            return;
        }

        await navigateTo('/login');
        return;
    }

    showAlert('success', 'Sikeres módosítás.');
    resetToMenu();
};

const saveAllergies = async () => {
    const validationMessage = validateSelectedAllergies(selectedAllergies.value);

    if (validationMessage) {
        showError(validationMessage);
        return;
    }

    const success = await preferences.saveSelectedAllergies(currentAuthUserId.value);

    if (!success) {
        showError(preferences.errorMessage || 'Hiba történt mentéskor.');
        return;
    }

    showAlert('success', 'Allergén(ek) sikeresen hozzáadva.');
    resetToMenu();
};

const saveDislikedIngredient = async () => {
    const validationMessage = validateDislikedIngredient(
        dislikedIngredientInput.value,
        dislikedIngredients.value,
    );

    if (validationMessage) {
        showError(validationMessage);
        return;
    }

    dislikedIngredients.value.push(dislikedIngredientInput.value.trim());
    showAlert('success', 'A nem kedvelt alapanyag sikeresen hozzáadva.');
    resetToMenu();
};

const saveHandlers = {
    username: saveUsername,
    email: saveEmail,
    password: savePassword,
    allergen: saveAllergies,
    dislikedIngredient: saveDislikedIngredient,
};

const handleSave = async () => {
    const saveHandler = saveHandlers[activeSection.value];

    if (saveHandler) {
        await saveHandler();
    }
};
</script>

<template>
    <div class="profile-page py-4">
        <div class="profile-shell p-3 p-md-4 rounded-3 shadow w-100">
            <div class="row g-4">
                <div class="col-12 col-lg-4">
                    <div class="shadow-sm rounded-3">
                        <div class="card-body shadow-sm p-4">
                            <div class="text-center mb-4">
                                <div class="avatar-wrap mx-auto mb-3 position-relative">
                                    <div class="avatar-circle d-flex align-items-center justify-content-center">
                                        <img :src="displayProfileImage" alt="Profile" title="Profile picture">
                                    </div>
                                    <button class="avatar-camera" type="button" @click="openProfileImagePicker">
                                        <i class="bi bi-camera-fill"></i>
                                    </button>
                                    <input ref="profileImageInput" type="file" accept="image/*" class="d-none"
                                        @change="handleProfileImageChange">
                                </div>
                                <h5 class="mb-0">{{ displayedUsername }}</h5>
                            </div>

                            <ProfileBadgeList class="mb-4" title="Nem kedvelt alapanyagok" :items="dislikedIngredients"
                                empty-text="Még nincs hozzáadott alapanyag." @remove="removeDislikedIngredient" />

                            <ProfileBadgeList title="Allergének" :items="userAllergies" display-key="name"
                                empty-text="Még nincs hozzáadott allergén." @remove="removeAllergen" />
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

                            <button v-for="item in sidebarItems" :key="item.key" type="button"
                                class="list-group-item list-group-item-action d-flex align-items-center gap-2"
                                :class="{ active: activeSection === item.key }" @click="openSection(item.key)">
                                <i class="bi" :class="item.icon"></i>
                                <span>{{ item.label }}</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="col-12 col-lg-8 d-flex">
                    <div class="card custshadow rounded-3 w-100 right-card">
                        <div class="card-body p-4 p-md-5 h-100 d-flex flex-column">
                            <ProfileSectionCard v-if="activeSection === 'menu'" title="Profil beállítások">
                                <div class="settings-options">
                                    <ProfileSettingsOption v-for="option in settingsOptions" :key="option.key"
                                        :icon="option.icon" :title="option.title" @click="openSection(option.key)" />
                                </div>
                            </ProfileSectionCard>

                            <ProfileSectionCard v-if="activeSection === 'username'" title="Felhasználónév módosítása">
                                <form class="d-flex flex-column flex-grow-1" @submit.prevent="handleSave">
                                    <div class="mb-4">
                                        <FormInput v-model="usernameInput" label="Felhasználónév" type="text" />
                                    </div>

                                    <ProfileSectionActions @cancel="resetToMenu" @save="handleSave" />
                                </form>
                            </ProfileSectionCard>

                            <ProfileSectionCard v-if="activeSection === 'password'" title="Jelszó módosítása">
                                <form class="d-flex flex-column flex-grow-1" @submit.prevent="handleSave">
                                    <div class="mb-3">
                                        <FormInput v-model="currentPasswordInput" label="Aktuális jelszó"
                                            type="password" />
                                    </div>

                                    <div class="mb-3">
                                        <FormInput v-model="newPasswordInput" label="Új jelszó" type="password" />
                                    </div>

                                    <div class="mb-3">
                                        <FormInput v-model="confirmPasswordInput" label="Add meg újra a jelszavad"
                                            type="password" />
                                    </div>

                                    <div class="form-check mb-4">
                                        <input id="signOutEverywhere" v-model="signOutEverywhere"
                                            class="form-check-input" type="checkbox">
                                        <label class="form-check-label" for="signOutEverywhere">
                                            Jelentkeztess ki mindenhonnan
                                        </label>
                                    </div>

                                    <ProfileSectionActions @cancel="resetToMenu" @save="handleSave" />
                                </form>
                            </ProfileSectionCard>

                            <ProfileSectionCard v-if="activeSection === 'email'" title="Email módosítása">
                                <form class="d-flex flex-column flex-grow-1" @submit.prevent="handleSave">
                                    <div class="mb-3">
                                        <FormInput v-model="emailInput" label="Email" type="email" />
                                    </div>

                                    <div class="mb-4">
                                        <FormInput v-model="newEmailInput" label="Új email" type="email" />
                                    </div>

                                    <ProfileSectionActions @cancel="resetToMenu" @save="handleSave" />
                                </form>
                            </ProfileSectionCard>

                            <ProfileSectionCard v-if="activeSection === 'allergen'" title="Allergén hozzáadása">
                                <form class="d-flex flex-column flex-grow-1" @submit.prevent="handleSave">
                                    <div class="mb-4 position-relative">
                                        <FormInput v-model="allergenInput" label="Allergén neve" type="text" />

                                        <ProfileBadgeList v-if="selectedAllergies.length" class="mb-3"
                                            :items="selectedAllergies" display-key="name"
                                            @remove="removeSelectedAllergen" />

                                        <div v-if="hasTypedAllergen" class="allergy-suggestions list-group shadow-sm">
                                            <button v-for="allergy in filteredAllergies" :key="allergy.id" type="button"
                                                class="list-group-item list-group-item-action allergy-suggestion-btn"
                                                @click="selectAllergy(allergy)">
                                                {{ allergy.name }}
                                            </button>

                                            <div v-if="!filteredAllergies.length"
                                                class="list-group-item text-muted small">
                                                Nincs ilyen allergén a listában.
                                            </div>
                                        </div>
                                    </div>

                                    <ProfileSectionActions :save-text="preferencesSaving ? 'Mentés...' : 'Hozzáadás'"
                                        :save-disabled="preferencesSaving" @cancel="resetToMenu" @save="handleSave" />
                                </form>
                            </ProfileSectionCard>

                            <ProfileSectionCard v-if="activeSection === 'dislikedIngredient'"
                                title="Nem kedvelt alapanyagok hozzáadása">
                                <form class="d-flex flex-column flex-grow-1" @submit.prevent="handleSave">
                                    <div class="mb-4">
                                        <FormInput v-model="dislikedIngredientInput" label="Nem kedvelt alapanyag neve"
                                            type="text" />
                                    </div>

                                    <ProfileSectionActions save-text="Hozzáadás" @cancel="resetToMenu"
                                        @save="handleSave" />
                                </form>
                            </ProfileSectionCard>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style src="~/assets/css/profile.css"></style>