<script setup>
definePageMeta({
    middleware: 'guest-only',
    layout: 'auth'
});

import { ref, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';

const { validatePasswordResetRequest } = useAuthValidation();

const authStore = useAuthStore();

onMounted(() => {
    authStore.clearMessages();
});

const email = ref('');
const submitAttempted = ref(false);
const formRef = ref(null);

const onSubmit = async () => {
    submitAttempted.value = true;
    authStore.clearMessages();

    if (!formRef.value || !formRef.value.checkValidity()) {
        return;
    }

    const validationError = validatePasswordResetRequest(email.value);

    if (validationError) {
        authStore.errorMessage = validationError;
        return;
    }

    const success = await authStore.requestPasswordReset(email.value);

    if (success) {
        email.value = '';
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
                    <h1 class="fs-1">{{ $t('auth.forgot.title') }}</h1>
                </div>

                <p class="text-center mb-4">
                    {{ $t('auth.forgot.lead') }}
                </p>

                <form ref="formRef" class="needs-validation" :class="{ 'was-validated': submitAttempted }" novalidate
                    @submit.prevent="onSubmit">
                    <FormInput v-model="email" :label="$t('auth.forgot.emailLabel')" type="email"
                        :placeholder="$t('auth.forgot.emailPlaceholder')" required />

                    <div v-if="authStore.errorMessage" class="alert alert-danger mt-3">
                        {{ authStore.errorMessage }}
                    </div>

                    <div v-if="authStore.successMessage" class="alert alert-success mt-3">
                        {{ authStore.successMessage }}
                    </div>

                    <Button type="submit" color="green" class="w-100 py-2 mt-4" :disabled="authStore.loading">
                        {{ authStore.loading ? $t('auth.forgot.submitting') : $t('auth.forgot.submit') }}
                    </Button>

                    <div class="mt-3 d-flex justify-content-center pt-3">
                        <NuxtLink to="/login">{{ $t('auth.forgot.backToLogin') }}</NuxtLink>
                    </div>
                </form>
            </div>
        </div>
    </section>
</template>

<style scoped src="~/assets/css/auth.css"></style>