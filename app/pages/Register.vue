<script setup>
definePageMeta({
    middleware: 'guest-only',
    layout: 'auth'
});

import { ref, computed, watch } from 'vue';
import EmailConfirmationModal from '~/components/auth/EmailConfirmationModal.vue';

const supabase = useSupabaseClient();

const email = ref("");
const username = ref("");
const password = ref("");
const repassword = ref("");
const acceptTerms = ref(false);
const submitAttempted = ref(false);
const formRef = ref(null);

const signupLoading = ref(false);
const authError = ref("");
const authSuccess = ref("");

const showConfirmationModal = ref(false);
const confirmationEmail = ref("");
const resendLoading = ref(false);
const resendMessage = ref("");
const resendError = ref("");

const usernameOk = computed(() => username.value.trim().length >= 4);
const passwordOk = computed(() => password.value.trim().length >= 6);
const passwordsMatch = computed(() => password.value === repassword.value);

const setCustomInputValidity = () => {
    if (!formRef.value) {
        return;
    }

    const inputs = formRef.value.querySelectorAll("input.form-control");
    const usernameInput = inputs[1];
    const passwordInput = inputs[2];
    const repasswordInput = inputs[3];

    if (usernameInput) {
        usernameInput.setCustomValidity(
            usernameOk.value ? "" : "A felhasználónév legalább 4 karakter legyen."
        );
    }

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

watch([username, password, repassword], setCustomInputValidity);

const onSubmit = async () => {
    submitAttempted.value = true;
    authError.value = "";
    authSuccess.value = "";
    resendMessage.value = "";
    resendError.value = "";
    setCustomInputValidity();

    if (!formRef.value || !formRef.value.checkValidity()) {
        return;
    }

    signupLoading.value = true;

    try {
        const trimmedEmail = email.value.trim().toLowerCase();
        const trimmedUsername = username.value.trim();

        const { data: existingEmailUser, error: emailCheckError } = await supabase
            .from('user')
            .select('id')
            .eq('email', trimmedEmail)
            .maybeSingle();

        if (emailCheckError) {
            authError.value = 'Nem sikerült ellenőrizni az email címet.';
            return;
        }

        if (existingEmailUser) {
            authError.value = 'Ezzel az email címmel már regisztráltak.';
            return;
        }

        const { data: existingUsernameUser, error: usernameCheckError } = await supabase
            .from('user')
            .select('id')
            .eq('username', trimmedUsername)
            .maybeSingle();

        if (usernameCheckError) {
            authError.value = 'Nem sikerült ellenőrizni a felhasználónevet.';
            return;
        }

        if (existingUsernameUser) {
            authError.value = 'Ez a felhasználónév már foglalt.';
            return;
        }

        const { error } = await supabase.auth.signUp({
            email: trimmedEmail,
            password: password.value,
            options: {
                data: {
                    username: trimmedUsername
                }
            }
        });

        if (error) {
            authError.value = error.message;
            return;
        }

        confirmationEmail.value = trimmedEmail;
        authSuccess.value = "Sikeres regisztráció!";
        showConfirmationModal.value = true;

        email.value = "";
        username.value = "";
        password.value = "";
        repassword.value = "";
        acceptTerms.value = false;
        submitAttempted.value = false;

        if (formRef.value) {
            formRef.value.reset();
        }
    } catch (error) {
        authError.value = "Váratlan hiba történt a regisztráció során.";
    } finally {
        signupLoading.value = false;
    }
};

const resendConfirmationEmail = async () => {
    resendMessage.value = "";
    resendError.value = "";

    if (!confirmationEmail.value) {
        resendError.value = "Nem található email cím az újraküldéshez.";
        return;
    }

    resendLoading.value = true;

    try {
        const emailRedirectTo =
            process.client ? `${window.location.origin}/confirm` : undefined;

        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: confirmationEmail.value,
            options: emailRedirectTo ? { emailRedirectTo } : undefined
        });

        if (error) {
            resendError.value = error.message;
            return;
        }

        resendMessage.value = "A megerősítő email újra elküldve.";
    } catch (error) {
        resendError.value = "Nem sikerült újraküldeni a megerősítő emailt.";
    } finally {
        resendLoading.value = false;
    }
};

const closeConfirmationModal = () => {
    showConfirmationModal.value = false;
    resendMessage.value = "";
    resendError.value = "";
};
</script>

<template>
    <section class="auth-form-page">
        <div class="auth-form-shell">
            <div class="auth-form-side d-flex flex-column justify-content-center">
                <div class="text-center mb-2">
                    <h1 class="fs-1">Regisztráció</h1>
                </div>

                <form ref="formRef" class="needs-validation" :class="{ 'was-validated': submitAttempted }" novalidate
                    @submit.prevent="onSubmit">
                    <FormInput v-model="email" label="Email cím" type="email" placeholder="Add meg az email címed"
                        required />

                    <FormInput v-model="username" label="Felhasználónév" type="text"
                        placeholder="Add meg a felhasználóneved" required />
                    <div v-if="submitAttempted && !usernameOk" class="invalid-feedback d-block mb-2">
                        A felhasználónév legalább 4 karakter legyen.
                    </div>

                    <FormInput v-model="password" label="Jelszó" type="password" placeholder="Add meg a jelszavad"
                        required />
                    <div v-if="submitAttempted && !passwordOk" class="invalid-feedback d-block mb-2">
                        A jelszó legalább 6 karakter legyen.
                    </div>

                    <FormInput v-model="repassword" label="Jelszó újra" type="password"
                        placeholder="Add meg újra a jelszavad" required />
                    <div v-if="submitAttempted && !passwordsMatch" class="invalid-feedback d-block mb-2">
                        A két jelszó nem egyezik.
                    </div>

                    <div class="form-check mb-3">
                        <input class="form-check-input" type="checkbox" v-model="acceptTerms" required />
                        <label class="form-check-label">
                            Elfogadom a felhasználói feltételeket
                        </label>
                        <div class="invalid-feedback">
                            A továbblépéshez el kell fogadnod a felhasználói feltételeket.
                        </div>
                    </div>

                    <div v-if="authError" class="alert alert-danger">
                        {{ authError }}
                    </div>

                    <div v-if="authSuccess" class="alert alert-success">
                        {{ authSuccess }}
                    </div>

                    <Button type="submit" color="orange" class="w-100 py-2" :disabled="signupLoading">
                        {{ signupLoading ? 'Regisztráció...' : 'Regisztrálás' }}
                    </Button>

                    <div class="mt-3 d-flex justify-content-center">
                        <p class="pe-3">Van már fiókod?</p>
                        <NuxtLink to="/login">Bejelentkezés</NuxtLink>
                    </div>
                </form>
            </div>
        </div>

        <EmailConfirmationModal :show="showConfirmationModal" :email="confirmationEmail" :resend-loading="resendLoading"
            :resend-message="resendMessage" :resend-error="resendError" @close="closeConfirmationModal"
            @resend="resendConfirmationEmail" />
    </section>
</template>

<style scoped src="~/assets/css/auth.css"></style>