<script setup>
import { storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { usePreferencesStore } from '~/stores/preferences';

const auth = useAuthStore();
const preferences = usePreferencesStore();
const route = useRoute();
const { showAlert } = useAlert();
const {
    validateUsernameChange,
    validateEmailChange,
    validatePasswordChange,
    validateSelectedAllergies,
    validateSelectedDislikedIngredients,
    validateDislikedIngredient,
} = useProfileValidation();

const {
    userAllergies,
    selectedAllergies,
    userDislikedIngredients,
    selectedDislikedIngredients,
    saving: preferencesSaving
} = storeToRefs(preferences);

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
const activeSection = ref('menu');
const profileImageInput = ref(null);

const routePaths = {
    menu: '/profile',
    username: '/profile/username',
    password: '/profile/password',
    email: '/profile/email',
    allergen: '/profile/allergen',
    dislikedIngredient: '/profile/dislikedIngredient',
};

const editableSections = Object.keys(routePaths).filter((section) => section !== 'menu');

const currentAuthUserId = computed(() => auth.user?.id || auth.user?.sub || '');
const filteredAllergies = computed(() => preferences.getFilteredAllergies(allergenInput.value));
const filteredDislikedIngredients = computed(() => preferences.getFilteredDislikedIngredients(dislikedIngredientInput.value));
const hasTypedAllergen = computed(() => allergenInput.value.trim().length > 0);
const hasTypedDislikedIngredient = computed(() => dislikedIngredientInput.value.trim().length > 0);
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

const preferenceOptions = [
    {
        key: 'allergen',
        icon: 'bi-shield-plus',
        title: 'Allergének',
    },
    {
        key: 'dislikedIngredient',
        icon: 'bi-slash-circle',
        title: 'Nem kedvelt alapanyagok',
    },
];

const expandedMobileGroup = ref(null);

const settingsSectionKeys = ['username', 'password', 'email'];
const preferenceSectionKeys = preferenceOptions.map((option) => option.key);

const settingsCardDescription = 'Felhasználónév, jelszó és email kezelése';
const preferencesCardDescription = 'Allergének és nem kedvelt alapanyagok hozzáadása';

const isSettingsSection = (section) => settingsSectionKeys.includes(section);
const isPreferenceSection = (section) => preferenceSectionKeys.includes(section);

const toggleMobileGroup = (group) => {
    expandedMobileGroup.value = expandedMobileGroup.value === group ? null : group;
};

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
        preferences.clearSelectedDislikedIngredients();
    },
};

const resetSection = (section) => {
    sectionResetters[section]?.();
};

const resetAllSections = () => {
    Object.keys(sectionResetters).forEach(resetSection);
};

const getRouteSection = () => {
    const section = Array.isArray(route.params.section)
        ? route.params.section[0]
        : route.params.section;

    return typeof section === 'string' ? section : '';
};

const syncSectionFromRoute = async () => {
    const routeSection = getRouteSection();

    if (!routeSection) {
        activeSection.value = 'menu';
        return;
    }

    if (!editableSections.includes(routeSection)) {
        await navigateTo('/profile', { replace: true });
        return;
    }

    activeSection.value = routeSection;
    resetSection(routeSection);
};

const resetToMenu = async () => {
    resetAllSections();
    activeSection.value = 'menu';
    expandedMobileGroup.value = null;

    if (route.path !== routePaths.menu) {
        await navigateTo(routePaths.menu);
    }
};

const openSection = async (section) => {
    if (!editableSections.includes(section)) {
        return;
    }

    resetSection(section);
    activeSection.value = section;

    if (route.path !== routePaths[section]) {
        await navigateTo(routePaths[section]);
    }
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

    const loadPreferenceDataSuccess = await preferences.loadPreferenceData(userId);

    if (!loadPreferenceDataSuccess) {
        showAlert('danger', preferences.errorMessage || 'Nem sikerült betölteni a preferenciákat.');
    }
};

watch(() => route.params.section, syncSectionFromRoute, { immediate: true });
watch(() => auth.user, syncProfileData, { immediate: true });
watch(activeSection, (section) => {
    if (isSettingsSection(section)) {
        expandedMobileGroup.value = 'settings';
        return;
    }

    if (isPreferenceSection(section)) {
        expandedMobileGroup.value = 'preferences';
    }
});

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

const selectDislikedIngredient = (ingredient) => {
    const added = preferences.addSelectedDislikedIngredient(ingredient);

    if (!added) {
        showError('Ez az alapanyag már szerepel a listában.');
        return;
    }

    dislikedIngredientInput.value = '';
};

const removeSelectedDislikedIngredient = (ingredient) => {
    preferences.removeSelectedDislikedIngredient(ingredient.id);
};

const removeAllergen = async (allergy) => {
    const success = await preferences.deleteUserAllergy(allergy.id, currentAuthUserId.value);

    if (!success) {
        showError(preferences.errorMessage || 'Az allergén törlése nem sikerült.');
        return;
    }

    showAlert('success', 'Allergén sikeresen törölve.');
};

const removeDislikedIngredient = async (ingredient) => {
    const success = await preferences.deleteUserDislikedIngredient(ingredient.id, currentAuthUserId.value);

    if (!success) {
        showError(preferences.errorMessage || 'A nem kedvelt alapanyag törlése nem sikerült.');
        return;
    }
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
    await resetToMenu();
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
    await resetToMenu();
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
    await resetToMenu();
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
    await resetToMenu();
};

const saveDislikedIngredient = async () => {
    const trimmedInput = dislikedIngredientInput.value.trim();

    if (trimmedInput) {
        const validationMessage = validateDislikedIngredient(
            trimmedInput,
            userDislikedIngredients.value,
            selectedDislikedIngredients.value,
        );

        if (validationMessage) {
            showError(validationMessage);
            return;
        }

        const exactMatch = filteredDislikedIngredients.value.find(
            item => item.name.toLowerCase() === trimmedInput.toLowerCase(),
        );

        if (exactMatch) {
            selectDislikedIngredient(exactMatch);
        }
    }

    const selectedValidationMessage = validateSelectedDislikedIngredients(selectedDislikedIngredients.value);

    if (selectedValidationMessage) {
        showError('Válassz ki legalább egy alapanyagot a listából.');
        return;
    }

    const success = await preferences.saveSelectedDislikedIngredients(currentAuthUserId.value);

    if (!success) {
        showError(preferences.errorMessage || 'Hiba történt mentéskor.');
        return;
    }
    showAlert('success', 'A nem kedvelt alapanyag sikeresen hozzáadva.');
    await resetToMenu();
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
                    <div class="shadow-sm rounded-3 profile-sidebar-panel">
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

                            <ProfileBadgeList class="mb-4" title="Nem kedvelt alapanyagok"
                                :items="userDislikedIngredients" empty-text="Még nincs hozzáadott alapanyag."
                                @remove="removeDislikedIngredient" />

                            <ProfileBadgeList title="Allergének" :items="userAllergies" display-key="name"
                                empty-text="Még nincs hozzáadott allergén." @remove="removeAllergen" />
                        </div>
                    </div>

                    <div class="mt-4 d-none d-lg-block">
                        <div class="list-group menu profile-sidebar-menu">
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

                    <div class="mt-4 d-lg-none">
                        <Transition name="mobile-panel-switch" mode="out-in">
                            <div v-if="activeSection === 'menu'" key="mobile-menu-stage" class="mobile-stage">
                                <div class="mobile-settings-group">
                                    <button type="button" class="mobile-menu-card"
                                        :class="{ 'is-open': expandedMobileGroup === 'settings', active: isProfileSettingsActive }"
                                        @click="toggleMobileGroup('settings')">
                                        <div class="mobile-menu-card-left">
                                            <div class="mobile-menu-card-icon">
                                                <i class="bi bi-person-lines-fill"></i>
                                            </div>

                                            <div class="mobile-menu-card-text">
                                                <h6 class="mb-1">Profil beállítások</h6>
                                                <p class="mb-0">{{ settingsCardDescription }}</p>
                                            </div>
                                        </div>

                                        <i class="bi bi-chevron-down mobile-menu-card-chevron"
                                            :class="{ rotated: expandedMobileGroup === 'settings' }"></i>
                                    </button>

                                    <div v-if="expandedMobileGroup === 'settings'" class="mobile-menu-panel">
                                        <div class="settings-options mobile-settings-options">
                                            <ProfileSettingsOption v-for="option in settingsOptions" :key="option.key"
                                                :icon="option.icon" :title="option.title"
                                                @click="openSection(option.key)" />
                                        </div>
                                    </div>
                                </div>

                                <div class="mobile-settings-group mt-3">
                                    <button type="button" class="mobile-menu-card"
                                        :class="{ 'is-open': expandedMobileGroup === 'preferences', active: isPreferenceSection(activeSection) }"
                                        @click="toggleMobileGroup('preferences')">
                                        <div class="mobile-menu-card-left">
                                            <div class="mobile-menu-card-icon">
                                                <i class="bi bi-sliders"></i>
                                            </div>

                                            <div class="mobile-menu-card-text">
                                                <h6 class="mb-1">Ételpreferenciák</h6>
                                                <p class="mb-0">{{ preferencesCardDescription }}</p>
                                            </div>
                                        </div>

                                        <i class="bi bi-chevron-down mobile-menu-card-chevron"
                                            :class="{ rotated: expandedMobileGroup === 'preferences' }"></i>
                                    </button>

                                    <div v-if="expandedMobileGroup === 'preferences'" class="mobile-menu-panel">
                                        <div class="settings-options mobile-settings-options">
                                            <ProfileSettingsOption v-for="option in preferenceOptions" :key="option.key"
                                                :icon="option.icon" :title="option.title"
                                                @click="openSection(option.key)" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div v-else key="mobile-form-stage"
                                class="card custshadow rounded-3 w-100 right-card mobile-section-card mt-3">
                                <div class="card-body p-4 h-100 d-flex flex-column">
                                    <ProfileSectionCard v-if="activeSection === 'username'"
                                        title="Felhasználónév módosítása">
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
                                                <FormInput v-model="newPasswordInput" label="Új jelszó"
                                                    type="password" />
                                            </div>

                                            <div class="mb-3">
                                                <FormInput v-model="confirmPasswordInput"
                                                    label="Add meg újra a jelszavad" type="password" />
                                            </div>

                                            <div class="form-check mb-4">
                                                <input id="signOutEverywhereMobile" v-model="signOutEverywhere"
                                                    class="form-check-input" type="checkbox">
                                                <label class="form-check-label" for="signOutEverywhereMobile">
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

                                                <div v-if="hasTypedAllergen"
                                                    class="allergy-suggestions list-group shadow-sm">
                                                    <button v-for="allergy in filteredAllergies" :key="allergy.id"
                                                        type="button"
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

                                            <ProfileSectionActions
                                                :save-text="preferencesSaving ? 'Mentés...' : 'Hozzáadás'"
                                                :save-disabled="preferencesSaving" @cancel="resetToMenu"
                                                @save="handleSave" />
                                        </form>
                                    </ProfileSectionCard>

                                    <ProfileSectionCard v-if="activeSection === 'dislikedIngredient'"
                                        title="Nem kedvelt alapanyagok hozzáadása">
                                        <form class="d-flex flex-column flex-grow-1" @submit.prevent="handleSave">
                                            <div class="mb-4 position-relative">
                                                <FormInput v-model="dislikedIngredientInput"
                                                    label="Nem kedvelt alapanyag neve" type="text" />

                                                <ProfileBadgeList v-if="selectedDislikedIngredients.length" class="mb-3"
                                                    :items="selectedDislikedIngredients" display-key="name"
                                                    @remove="removeSelectedDislikedIngredient" />

                                                <div v-if="hasTypedDislikedIngredient"
                                                    class="allergy-suggestions list-group shadow-sm">
                                                    <button v-for="ingredient in filteredDislikedIngredients"
                                                        :key="ingredient.id" type="button"
                                                        class="list-group-item list-group-item-action allergy-suggestion-btn"
                                                        @click="selectDislikedIngredient(ingredient)">
                                                        {{ ingredient.name }}
                                                    </button>

                                                    <div v-if="!filteredDislikedIngredients.length"
                                                        class="list-group-item text-muted small">
                                                        Nincs ilyen alapanyag a listában.
                                                    </div>
                                                </div>
                                            </div>

                                            <ProfileSectionActions
                                                :save-text="preferencesSaving ? 'Mentés...' : 'Hozzáadás'"
                                                :save-disabled="preferencesSaving" @cancel="resetToMenu"
                                                @save="handleSave" />
                                        </form>
                                    </ProfileSectionCard>
                                </div>
                            </div>
                        </Transition>
                    </div>
                </div>

                <div class="col-12 col-lg-8 d-none d-lg-flex">
                    <div class="card custshadow rounded-3 w-100 right-card">
                        <div class="card-body p-4 p-md-5 h-100 d-flex flex-column">
                            <Transition name="desktop-panel-switch" mode="out-in">
                                <div :key="activeSection" class="desktop-panel-stage h-100 d-flex flex-column">
                            <ProfileSectionCard v-if="activeSection === 'menu'" title="Profil beállítások">
                                <div class="settings-options">
                                    <ProfileSettingsOption v-for="option in settingsOptions" :key="option.key"
                                        :icon="option.icon" :title="option.title" @click="openSection(option.key)" />
                                </div>
                            </ProfileSectionCard>

                            <ProfileSectionCard v-else-if="activeSection === 'username'" title="Felhasználónév módosítása">
                                <form class="d-flex flex-column flex-grow-1" @submit.prevent="handleSave">
                                    <div class="mb-4">
                                        <FormInput v-model="usernameInput" label="Felhasználónév" type="text" />
                                    </div>

                                    <ProfileSectionActions @cancel="resetToMenu" @save="handleSave" />
                                </form>
                            </ProfileSectionCard>

                            <ProfileSectionCard v-else-if="activeSection === 'password'" title="Jelszó módosítása">
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

                            <ProfileSectionCard v-else-if="activeSection === 'email'" title="Email módosítása">
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

                            <ProfileSectionCard v-else-if="activeSection === 'allergen'" title="Allergén hozzáadása">
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

                            <ProfileSectionCard v-else-if="activeSection === 'dislikedIngredient'"
                                title="Nem kedvelt alapanyagok hozzáadása">
                                <form class="d-flex flex-column flex-grow-1" @submit.prevent="handleSave">
                                    <div class="mb-4 position-relative">
                                        <FormInput v-model="dislikedIngredientInput" label="Nem kedvelt alapanyag neve"
                                            type="text" />

                                        <ProfileBadgeList v-if="selectedDislikedIngredients.length" class="mb-3"
                                            :items="selectedDislikedIngredients" display-key="name"
                                            @remove="removeSelectedDislikedIngredient" />

                                        <div v-if="hasTypedDislikedIngredient"
                                            class="allergy-suggestions list-group shadow-sm">
                                            <button v-for="ingredient in filteredDislikedIngredients"
                                                :key="ingredient.id" type="button"
                                                class="list-group-item list-group-item-action allergy-suggestion-btn"
                                                @click="selectDislikedIngredient(ingredient)">
                                                {{ ingredient.name }}
                                            </button>

                                            <div v-if="!filteredDislikedIngredients.length"
                                                class="list-group-item text-muted small">
                                                Nincs ilyen alapanyag a listában.
                                            </div>
                                        </div>
                                    </div>

                                    <ProfileSectionActions :save-text="preferencesSaving ? 'Mentés...' : 'Hozzáadás'"
                                        :save-disabled="preferencesSaving" @cancel="resetToMenu" @save="handleSave" />
                                </form>
                            </ProfileSectionCard>
                                </div>
                            </Transition>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style src="~/assets/css/profile.css"></style>