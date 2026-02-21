<script setup>
import { ref, computed, watch } from 'vue';

const email = ref("");
const username = ref("");
const password = ref("");
const repassword = ref("");
const acceptTerms = ref(false);
const submitAttempted = ref(false);
const formRef = ref(null);

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

const onSubmit = () => {
    submitAttempted.value = true;
    setCustomInputValidity();

    if (!formRef.value || !formRef.value.checkValidity()) {
    return;
}
    console.log("ok");

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

                                <button type="submit" class="btn btn-primary w-100 py-2">
                                    Regisztrálás
                                </button>

                                <div class="mt-3 d-flex justify-content-center">
                                    <p class="pe-3">Van már fiókod?</p>
                                    <NuxtLink to="login">Bejelentkezés</NuxtLink>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div class="col-lg-6 d-none d-lg-block">
                        <img src="../assets/images/background.png" alt="recipe image" title="recipe image" />
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>

.register-page {
    min-height: 100vh;
    background: linear-gradient(160deg, #faf8f5 0%, #f5f4f4 55%, #fff9f4 100%);
}

.register-shell {
    min-height: 100vh;
    padding-top: 2rem;
    padding-bottom: 2rem;
}

img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-top-right-radius: 12px;
    border-bottom-right-radius: 12px;
}

.card {
    max-width: 1200px;
    width: 100%;
    border-radius: 12px;
    border: 2px solid rgba(173, 173, 173, 0.6);
}

a {
    color: #6f42c1 !important;
    cursor: pointer;
    font-size: 15px;
    text-decoration: none;
}



@media (max-width: 944.98px) {
    .register-shell {
        padding-left: 0 !important;
        padding-right: 0 !important;
        padding-top: 0 !important;
        padding-bottom: 0 !important;
    }

    .card {
        min-height: 100vh;
    }
}
</style>