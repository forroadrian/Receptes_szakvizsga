<script setup>
import { ref } from 'vue';

const username = ref("");
const password = ref("");
const submitAttempted = ref(false);
const formRef = ref(null);

const onSubmit = () => {
    submitAttempted.value = true;

    if (!formRef.value || !formRef.value.checkValidity()) {
        return;
    }

    console.log("ok");
};
</script>

<template>
    <section class="register-page">
        <div class="register-shell d-flex align-items-center justify-content-center px-3 py">
            <div class="card shadow-lg">
                <div class="row g-0">
                    <div class="col-12 col-lg-6">
                        <div class="p-4 form-side p-md-5 d-flex flex-column justify-content-center">
                            <div class="text-center mb-4">
                                <h1 class="fs-1">Bejelentkezés</h1>
                            </div>

                            <form ref="formRef" class="needs-validation" :class="{ 'was-validated': submitAttempted }" novalidate @submit.prevent="onSubmit">
                                <FormInput class="pt-3" v-model="username" label="Felhasználónév" type="text" placeholder="Add meg a felhasználóneved" required />

                                <FormInput class="pt-3" v-model="password" label="Jelszó" type="password" placeholder="Add meg a jelszavad" required />
                                
                                <button type="submit" class="btn btn-primary w-100 py-2 mt-4">
                                    Bejelentkezés
                                </button>

                                <div class="mt-3 d-flex justify-content-center pt-3">
                                    <p class="pe-3">Nincs még fiókod?</p>
                                    <NuxtLink to="register">Regisztráció</NuxtLink>
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

img {
    width: 100%;
    height: 100%;
    min-height: 500px;
    object-fit: cover;
    border-top-right-radius: 12px;
    border-bottom-right-radius: 12px;
}

.card {
    max-width: 1200px;
    width: 100%;
    border-radius: 12px;
    min-height: 500px;
    border: 2px solid rgba(211, 209, 209, 0.6);
}

a {
    color: #6f42c1 !important;
    cursor: pointer;
    font-size: 15px;
    text-decoration: none;
}

.py {
    padding-top: 8rem;
}

@media (max-width: 944.98px) {
    .register-shell {
        padding-left: 0 !important;
        padding-right: 0 !important;
        padding-top: 0 !important;
    }

    .card {
        min-height: 100vh;
    }
}
</style>