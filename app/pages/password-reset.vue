<script setup>
definePageMeta({
    layout: 'auth'
});

import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useAuthStore } from '~/stores/auth';

const { validatePasswordReset } = useAuthValidation();

const authStore = useAuthStore();
const supabase = useSupabaseClient();

const password = ref('');
const repassword = ref('');
const recoveryReady = ref(false);
const submitAttempted = ref(false);
const formRef = ref(null);

const passwordOk = computed(() => password.value.trim().length >= 6);
const passwordsMatch = computed(() => password.value === repassword.value);

let authListener = null;

const setCustomInputValidity = () => {
    if (!formRef.value) {
        return;
    }

    const inputs = formRef.value.querySelectorAll("input.form-control");
    const passwordInput = inputs[0];
    const repasswordInput = inputs[1];

    if (passwordInput) {
        passwordInput.setCustomValidity(
            passwordOk.value ? "" : "A jelszó legalább 6 karakter legyen."
        );
    }

    if (repasswordInput) {
        repasswordInput.setCustomValidity(
            passwordsMatch.value ? "" : "A két jelszó nem egyezik."
        );
    }
};

watch([password, repassword], setCustomInputValidity);

onMounted(async () => {
    authStore.clearMessages();

    const { data } = await supabase.auth.getSession();
    recoveryReady.value = !!data.session;

    const listener = supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
            recoveryReady.value = true;
        }
    });

    authListener = listener.data.subscription;
});

onUnmounted(() => {
    if (authListener) {
        authListener.unsubscribe();
    }
});

const onSubmit = async () => {
    submitAttempted.value = true;
    authStore.clearMessages();
    setCustomInputValidity();

    if (!recoveryReady.value) {
        authStore.clearMessages();
        return;
    }

    if (!formRef.value || !formRef.value.checkValidity()) {
        return;
    }

    const validationError = validatePasswordReset(password.value, repassword.value);

    if (validationError) {
        authStore.errorMessage = validationError;
        return;
    }

    const success = await authStore.completePasswordReset(password.value);

    if (success) {
        password.value = '';
        repassword.value = '';
        submitAttempted.value = false;

        if (formRef.value) {
            formRef.value.reset();
        }
    }
}
</script>

<template>
    <section class="auth-form-page">
        <div class="auth-form-shell">
            <div class="auth-form-side d-flex flex-column justify-content-center">
                <div class="text-center mb-4">
                    <h1 class="fs-1">Új jelszó beállítása</h1>
                </div>

                <div v-if="!recoveryReady" class="alert alert-warning">
                    A jelszó-visszaállító link megnyitása után itt tudod beállítani az új jelszavad.
                </div>

                <form ref="formRef" class="needs-validation" :class="{ 'was-validated': submitAttempted }" novalidate
                    @submit.prevent="onSubmit">
                    <FormInput v-model="password" label="Új jelszó" type="password"
                        placeholder="Add meg az új jelszavad" required />
                    <div v-if="submitAttempted && !passwordOk" class="invalid-feedback d-block mb-2">
                        A jelszó legalább 6 karakter legyen.
                    </div>

                    <FormInput v-model="repassword" label="Új jelszó újra" type="password"
                        placeholder="Add meg újra az új jelszavad" required />
                    <div v-if="submitAttempted && !passwordsMatch" class="invalid-feedback d-block mb-2">
                        A két jelszó nem egyezik.
                    </div>

                    <div v-if="authStore.errorMessage" class="alert alert-danger mt-3">
                        {{ authStore.errorMessage }}
                    </div>

                    <div v-if="authStore.successMessage" class="alert alert-success mt-3">
                        {{ authStore.successMessage }}
                    </div>

                    <Button type="submit" class="btn grad green w-100 py-2 mt-4" :disabled="authStore.loading">
                        {{ authStore.loading ? 'Mentés...' : 'Új jelszó mentése' }}
                    </Button>

                    <div class="mt-3 d-flex justify-content-center pt-3">
                        <NuxtLink to="/login">Vissza a bejelentkezéshez</NuxtLink>
                    </div>
                </form>
            </div>
        </div>
    </section>
</template>

<style scoped src="~/assets/css/auth.css"></style>