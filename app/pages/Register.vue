<script setup>
import { ref, computed } from 'vue';

const email = ref("");
const username = ref("");
const password = ref("");
const repassword = ref("");
const acceptTerms = ref(false);
const submitAttempted = ref(false);

const usernameOk = computed(() => username.value.trim().length >= 4);
const passwordOk = computed(() => password.value.trim().length >= 6);
const passwordsMatch = computed(() => password.value === repassword.value);

const formOk = computed(() => {
    return (
        email.value.trim().length > 0 &&
        usernameOk.value &&
        passwordOk.value &&
        passwordsMatch.value &&
        acceptTerms.value
    )
});

const onSubmit = () => {
    submitAttempted.value = true;

    if (!formOk.value) {
        return;
    }
};
</script>


<template>
    <div class="d-flex align-items-center justify-content-center px-3 py">
        <div class="card shadow-lg">
            <div class="row g-0">
                <div class="col-12 col-lg-6">
                    <div class="p-4 form-side p-md-5 d-flex flex-column justify-content-center">
                        <div class="text-center mb-4">
                            <h1 class="fs-1">Regisztráció</h1>
                        </div>

                        <form @submit.prevent="onSubmit">
                            <FormInput v-model="email" label="Email cím" type="email" placeholder="Add meg az email címed" required />

                            <FormInput v-model="username" label="Felhasználónév" type="text" placeholder="Add meg a felhasználóneved" required />
                            <div v-if="submitAttempted && !usernameOk" class="text-danger mb-3">
                                A felhasználónév legalább 4 karakter legyen.
                            </div>

                            <FormInput v-model="password" label="Jelszó" type="password" placeholder="Add meg a jelszavad" required />
                            <div v-if="submitAttempted && !passwordOk" class="text-danger mb-3">
                                A jelszó legalább 6 karakter legyen.
                            </div>  

                            <FormInput v-model="repassword" label="Jelszó újra" type="password" placeholder="Add meg újra a jelszavad" required />
                            <div v-if="submitAttempted && !passwordsMatch" class="text-danger mb-3">
                                A két jelszó nem egyezik.
                            </div>

                            <div class="form-check mb-3">
                                <input class="form-check-input" type="checkbox" v-model="acceptTerms" required/>
                                <label class="form-check-label">
                                    Elfogadom a felhasználói feltételeket
                                </label>
                            </div>

                            <button type="submit" class="btn btn-primary w-100 py-2">
                                Regisztrálok
                            </button>

                            <div class="mt-3 d-flex justify-content-between">
                                <a href="#">Van már fiókod?</a>
                                <a href="#">Bejelentkezés</a>
                            </div>
                        </form>
                    </div>
                </div>

                <div class="col-lg-6 d-none d-lg-block">
                    <img src="../assets/images/background.png" alt="recipe image" title="recipe image"/>
                </div>
            </div>
        </div>
    </div>
</template>


<style scoped>
img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.card {
    max-width: 1200px;
    width: 100%;
    border-radius: 18px;
    border: 1px solid rgba(255, 255, 255, 0.6);
}

a {
    text-decoration: none;
    color: #6f42c1;
    font-size: 15px;
}

.py{
    padding-top: 8rem;
}
</style>