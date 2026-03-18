<script setup>
definePageMeta({
    middleware: 'guest-only',
    layout: 'auth'
});

import { ref } from 'vue';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();

const loginValue = ref('');
const password = ref('');
const submitAttempted = ref(false);
const formRef = ref(null);

const onSubmit = async () => {
    submitAttempted.value = true;
    authStore.clearMessages();

    if (!formRef.value || !formRef.value.checkValidity()) {
        return;
    }

    const success = await authStore.signIn(loginValue.value, password.value);

    if (success) {
        loginValue.value = '';
        password.value = '';
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
                    <h1 class="fs-1">Bejelentkezés</h1>
                </div>

                <form ref="formRef" class="needs-validation" :class="{ 'was-validated': submitAttempted }" novalidate
                    @submit.prevent="onSubmit">
                    <FormInput class="pt-3" v-model="loginValue" label="Email cím vagy felhasználónév" type="text"
                        placeholder="Add meg az emailed vagy a felhasználóneved" required />

                    <FormInput class="pt-3" v-model="password" label="Jelszó" type="password"
                        placeholder="Add meg a jelszavad" required />

                    <div v-if="authStore.errorMessage" class="alert alert-danger mt-3">
                        {{ authStore.errorMessage }}
                    </div>

                    <div v-if="authStore.successMessage" class="alert alert-success mt-3">
                        {{ authStore.successMessage }}
                    </div>

                    <Button type="submit" class="btn grad green w-100 py-2 mt-4" :disabled="authStore.loading">
                        {{ authStore.loading ? 'Bejelentkezés...' : 'Bejelentkezés' }}
                    </Button>

                    <div class="mt-3 d-flex justify-content-center pt-3">
                        <p class="pe-3">Nincs még fiókod?</p>
                        <NuxtLink to="/register">Regisztráció</NuxtLink>
                    </div>
                </form>
            </div>
        </div>
    </section>
</template>

<style scoped src="~/assets/css/auth.css"></style>