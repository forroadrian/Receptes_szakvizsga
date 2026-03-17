<script setup>
import { ref, computed, watch } from 'vue';

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
        usernameInput.setCustomValidity(usernameOk.value ? "" : "A felhasználónév legalább 4 karakter legyen.");
    }

    if (passwordInput) {
        passwordInput.setCustomValidity(passwordOk.value ? "" : "A jelszó legalább 6 karakter legyen.");
    }

    if (repasswordInput) {
        repasswordInput.setCustomValidity(passwordsMatch.value ? "" : "A két jelszó nem egyezik.");
    }
};

watch([username, password, repassword], setCustomInputValidity);

const onSubmit = async () => {
    submitAttempted.value = true;
    authError.value = "";
    authSuccess.value = "";
    setCustomInputValidity();

    if (!formRef.value || !formRef.value.checkValidity()) {
        return;
    }

    signupLoading.value = true;

    try {
        const { data, error } = await supabase.auth.signUp({
            email: email.value,
            password: password.value,
            options: {
                data: {
                    username: username.value
                }
            }
        });

        if (error) {
            authError.value = error.message;
            return;
        }

        confirmationEmail.value = email.value;
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
    <section class="register-page">
        <div class="register-shell d-flex align-items-center justify-content-center px-3">
            <div class="card shadow-lg align-self-center">
                <div class="row g-0">
                    <div class="col-12 col-lg-6">
                        <div class="p-4 form-side p-md-5 d-flex flex-column justify-content-center">
                            <div class="text-center mb-4">
                                <h1 class="fs-1">Regisztráció</h1>
                            </div>

                            <form ref="formRef" class="needs-validation" :class="{ 'was-validated': submitAttempted }"
                                novalidate @submit.prevent="onSubmit">
                                <FormInput v-model="email" label="Email cím" type="email"
                                    placeholder="Add meg az email címed" required />

                                <FormInput v-model="username" label="Felhasználónév" type="text"
                                    placeholder="Add meg a felhasználóneved" required />
                                <div v-if="submitAttempted && !usernameOk" class="invalid-feedback d-block mb-2">
                                    A felhasználónév legalább 4 karakter legyen.
                                </div>

                                <FormInput v-model="password" label="Jelszó" type="password"
                                    placeholder="Add meg a jelszavad" required />
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
                                    <div class="invalid-feedback">A továbblépéshez el kell fogadnod a felhasználói
                                        feltételeket.</div>
                                </div>

                                <div v-if="authError" class="alert alert-danger">
                                    {{ authError }}
                                </div>

                                <div v-if="authSuccess" class="alert alert-success">
                                    {{ authSuccess }}
                                </div>

                                <Button type="submit" class="grad orange w-100 py-2" :disabled="signupLoading">
                                    {{ signupLoading ? 'Regisztráció...' : 'Regisztrálás' }}
                                </Button>

                                <div class="mt-3 d-flex justify-content-center">
                                    <p class="pe-3">Van már fiókod?</p>
                                    <NuxtLink to="login">Bejelentkezés</NuxtLink>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div class="col-lg-6 d-none d-lg-block">
                        <img src="/images/background.webp" alt="recipe image" title="recipe image" />
                    </div>
                </div>
            </div>
        </div>

        <div v-if="showConfirmationModal" class="confirm-overlay">
            <div class="confirm-modal">
                <button type="button" class="confirm-close" @click="closeConfirmationModal">×</button>

                <div class="confirm-icon-wrap">
                    <img src="../assets/images/authentication.png" alt="">
                </div>

                <h2 class="confirm-title">Email megerősítés</h2>

                <p class="confirm-text">
                    Küldtünk egy megerősítő emailt erre a címre:
                    <span class="confirm-email">{{ confirmationEmail }}</span>
                </p>

                <p class="confirm-text mb-0">
                    Kérlek, nyisd meg az emailedet, és kattints a levélben található linkre a regisztráció
                    befejezéséhez.
                </p>

                <div v-if="resendMessage" class="alert alert-success mt-4 mb-2">
                    {{ resendMessage }}
                </div>

                <div v-if="resendError" class="alert alert-danger mt-4 mb-2">
                    {{ resendError }}
                </div>

                <div class="confirm-resend">
                    <span>Nem kaptad meg az emailt?</span>
                    <button type="button" class="confirm-resend-link" :disabled="resendLoading"
                        @click="resendConfirmationEmail">
                        {{ resendLoading ? 'Újraküldés...' : 'Újraküldés' }}
                    </button>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped src="~/assets/css/auth.css"></style>

<style scoped>
.confirm-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    z-index: 9999;
}

.confirm-modal {
    position: relative;
    width: 100%;
    max-width: 720px;
    background: white;
    border-radius: 24px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
    padding: 40px 32px 28px;
    text-align: center;
}

.confirm-close {
    position: absolute;
    top: 14px;
    right: 18px;
    border: none;
    background: transparent;
    font-size: 34px;
    line-height: 1;
    color: #6c757d;
    cursor: pointer;
}

.confirm-icon-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
}

.confirm-icon-wrap img {
    width: 70%;
    height: 50%;
    object-fit: contain;
}

.confirm-icon {
    font-size: 82px;
    color: #20c997;
}

.confirm-title {
    font-size: 2rem;
    margin-bottom: 16px;
}

.confirm-text {
    font-size: 1.05rem;
    color: #555;
    margin-bottom: 10px;
}

.confirm-email {
    color: #0d6efd;
    font-weight: 600;
    word-break: break-word;
}

.confirm-resend {
    margin-top: 28px;
    padding-top: 20px;
    border-top: 1px solid #e9ecef;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    font-size: 1rem;
}

.confirm-resend-link {
    border: none;
    background: transparent;
    color: #0d6efd;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    padding: 0;
}

.confirm-resend-link:disabled {
    opacity: 0.65;
    cursor: not-allowed;
}

@media (max-width: 576px) {
    .confirm-modal {
        padding: 32px 20px 24px;
        border-radius: 18px;
    }

    .confirm-title {
        font-size: 1.6rem;
    }

    .confirm-icon {
        font-size: 64px;
    }
}
</style>