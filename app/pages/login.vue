<script setup>
definePageMeta({
    middleware: 'guest-only',
    layout: 'auth'
});

import { ref, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();

onMounted(() => {
    authStore.clearMessages();
});

const loginValue = ref('');
const password = ref('');
const rememberMe = ref(false);
const submitAttempted = ref(false);
const formRef = ref(null);

const onSubmit = async () => {
    submitAttempted.value = true;
    authStore.clearMessages();

    if (!formRef.value || !formRef.value.checkValidity()) {
        return;
    }

    const success = await authStore.signIn(loginValue.value, password.value, rememberMe.value);

    if (success) {
        loginValue.value = '';
        password.value = '';
        rememberMe.value = false;
        submitAttempted.value = false;
        authStore.clearMessages();

        await navigateTo('/');
    }
}
</script>

<template>
    <section class="auth-form-page">
        <div class="auth-form-shell">
            <div class="auth-form-side d-flex flex-column justify-content-center">
                <div class="text-center mb-4">
                    <h1 class="fs-1">{{ $t('login.heading') }}</h1>
                </div>

                <form ref="formRef" class="needs-validation" :class="{ 'was-validated': submitAttempted }" novalidate
                    @submit.prevent="onSubmit">
                    <FormInput class="pt-3" v-model="loginValue" :label="$t('login.fields.identifier')" type="text"
                        :placeholder="$t('login.fields.identifierPlaceholder')" required />

                    <FormInput class="pt-3" v-model="password" :label="$t('login.fields.password')" type="password"
                        :placeholder="$t('login.fields.passwordPlaceholder')" required />

                    <div class="auth-login-options d-flex justify-content-between align-items-center flex-wrap gap-2 mt-2 mb-3">
                        <div class="form-check m-0">
                            <input id="rememberMe" class="form-check-input" type="checkbox" v-model="rememberMe">
                            <label class="form-check-label" for="rememberMe">
                                {{ $t('login.rememberMe') }}
                            </label>
                        </div>

                        <NuxtLink to="/forgot-password" :class="{ 'link-disabled': authStore.loading }">{{ $t('login.forgotPassword') }}</NuxtLink>
                    </div>

                    <div v-if="authStore.errorMessage" class="alert alert-danger mt-3">
                        {{ authStore.errorMessage }}
                    </div>

                    <div v-if="authStore.successMessage" class="alert alert-success mt-3">
                        {{ authStore.successMessage }}
                    </div>

                    <Button type="submit" color="green" class="w-100 py-2 mt-4" :disabled="authStore.loading">
                        {{ authStore.loading ? $t('login.submitting') : $t('login.submit') }}
                    </Button>

                    <div class="mt-3 d-flex justify-content-center pt-3">
                        <p class="pe-3">{{ $t('login.noAccount') }}</p>
                        <NuxtLink to="/register" :class="{ 'link-disabled': authStore.loading }">{{ $t('login.registerLink') }}</NuxtLink>
                    </div>
                </form>
            </div>
        </div>
    </section>
</template>

<style scoped src="~/assets/css/auth.css"></style>
