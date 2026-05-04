<script setup>
definePageMeta({
    layout: 'auth'
});

import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useAuthStore } from '~/stores/auth';

const route = useRoute();
const { t } = useI18n();
const { validatePasswordReset } = useAuthValidation();

const authStore = useAuthStore();
const supabase = useSupabaseClient();

const password = ref('');
const repassword = ref('');
const recoveryReady = ref(false);
const verifyingRecovery = ref(true);
const submitAttempted = ref(false);
const passwordChanged = ref(false);
const formRef = ref(null);

const passwordOk = computed(() => password.value.trim().length >= 6);
const passwordsMatch = computed(() => password.value === repassword.value);

let authListener = null;

const RECOVERY_FLAG = 'menuplanr_password_recovery_verified';

const markRecoveryReady = () => {
    recoveryReady.value = true;

    if (process.client) {
        sessionStorage.setItem(RECOVERY_FLAG, '1');
    }
};

const clearRecoveryReady = () => {
    recoveryReady.value = false;

    if (process.client) {
        sessionStorage.removeItem(RECOVERY_FLAG);
    }
};

const setCustomInputValidity = () => {
    if (!formRef.value) return;

    const inputs = formRef.value.querySelectorAll("input.form-control");
    const passwordInput = inputs[0];
    const repasswordInput = inputs[1];

    if (passwordInput) {
        passwordInput.setCustomValidity(
            passwordOk.value ? "" : t('auth.reset.passwordTooShort')
        );
    }

    if (repasswordInput) {
        repasswordInput.setCustomValidity(
            passwordsMatch.value ? "" : t('auth.reset.passwordMismatch')
        );
    }
};

watch([password, repassword], setCustomInputValidity);

const prepareRecoverySession = async () => {
    authStore.clearMessages();
    verifyingRecovery.value = true;

    const code = typeof route.query.code === 'string' ? route.query.code : '';
    const tokenHash = typeof route.query.token_hash === 'string' ? route.query.token_hash : '';
    const type = typeof route.query.type === 'string' ? route.query.type : '';

    try {
        if (process.client && sessionStorage.getItem(RECOVERY_FLAG) === '1') {
            const { data: sessionData } = await supabase.auth.getSession();

            if (sessionData.session) {
                recoveryReady.value = true;
                return;
            }

            sessionStorage.removeItem(RECOVERY_FLAG);
        }

        if (tokenHash && type === 'recovery') {
            const { error } = await supabase.auth.verifyOtp({
                token_hash: tokenHash,
                type: 'recovery'
            });

            if (error) {
                clearRecoveryReady();
                authStore.errorMessage = t('auth.reset.errors.linkExpired');
                return;
            }

            markRecoveryReady();

            if (process.client) {
                window.history.replaceState({}, document.title, '/password-reset');
            }

            return;
        }

        if (code) {
            const { error } = await supabase.auth.exchangeCodeForSession(code);

            if (error) {
                clearRecoveryReady();
                authStore.errorMessage = t('auth.reset.errors.linkExpired');
                return;
            }

            markRecoveryReady();

            if (process.client) {
                window.history.replaceState({}, document.title, '/password-reset');
            }

            return;
        }

        clearRecoveryReady();
        authStore.errorMessage = t('auth.reset.errors.linkMissing');
    } finally {
        verifyingRecovery.value = false;
    }
};

onMounted(async () => {
    await prepareRecoverySession();

    const listener = supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') {
            markRecoveryReady();
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
        authStore.errorMessage = t('auth.reset.errors.linkExpired');
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

    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session) {
        clearRecoveryReady();
        authStore.errorMessage = t('auth.reset.errors.sessionLost');
        return;
    }

    const success = await authStore.completePasswordReset(password.value);

    if (success) {
        passwordChanged.value = true;
        clearRecoveryReady();
        password.value = '';
        repassword.value = '';
        submitAttempted.value = false;

        if (formRef.value) {
            formRef.value.reset();
        }
    }
};
</script>

<template>
    <section class="auth-form-page">
        <div class="auth-form-shell">
            <div class="auth-form-side d-flex flex-column justify-content-center">
                <div class="text-center mb-4">
                    <h1 class="fs-1">{{ $t('auth.reset.title') }}</h1>
                </div>

                <template v-if="passwordChanged">
                    <div class="alert alert-success">
                        {{ authStore.successMessage }}
                    </div>
                    <Button to="/login" color="green" class="w-100 py-2 mt-2">
                        {{ $t('auth.reset.goToLogin') }}
                    </Button>
                </template>

                <template v-else>
                    <div v-if="verifyingRecovery" class="alert alert-info">
                        {{ $t('auth.reset.verifying') }}
                    </div>

                    <div v-else-if="!recoveryReady" class="alert alert-warning">
                        {{ $t('auth.reset.linkInvalid') }}
                    </div>

                    <form ref="formRef" class="needs-validation" :class="{ 'was-validated': submitAttempted }" novalidate
                        @submit.prevent="onSubmit">
                        <FormInput v-model="password" :label="$t('auth.reset.passwordLabel')" type="password"
                            :placeholder="$t('auth.reset.passwordPlaceholder')" required />
                        <div v-if="submitAttempted && !passwordOk" class="invalid-feedback d-block mb-2">
                            {{ $t('auth.reset.passwordTooShort') }}
                        </div>

                        <FormInput v-model="repassword" :label="$t('auth.reset.repasswordLabel')" type="password"
                            :placeholder="$t('auth.reset.repasswordPlaceholder')" required />
                        <div v-if="submitAttempted && !passwordsMatch" class="invalid-feedback d-block mb-2">
                            {{ $t('auth.reset.passwordMismatch') }}
                        </div>

                        <div v-if="authStore.errorMessage" class="alert alert-danger mt-3">
                            {{ authStore.errorMessage }}
                        </div>

                        <Button type="submit" color="green" class="w-100 py-2 mt-4" :disabled="authStore.loading">
                            {{ authStore.loading ? $t('auth.reset.submitting') : $t('auth.reset.submit') }}
                        </Button>

                        <div class="mt-3 d-flex justify-content-center pt-3">
                            <NuxtLink to="/login">{{ $t('auth.reset.backToLogin') }}</NuxtLink>
                        </div>
                    </form>
                </template>
            </div>
        </div>
    </section>
</template>

<style scoped src="~/assets/css/auth.css"></style>
