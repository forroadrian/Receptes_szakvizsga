<script setup>
import { ref, computed } from 'vue';

const email = ref("");
const username = ref("");
const password = ref("");
const submitAttempted = ref(false);

const usernameOk = computed(() => username.value.trim().length >= 4);
const passwordOk = computed(() => password.value.trim().length >= 6);

const formOk = computed(() => {
    return (
        email.value.trim().length > 0 &&
        usernameOk.value &&
        passwordOk.value
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
        <div class="card shadow">
            <div class="row g-0">
                <div class="col-12 col-lg-6">
                    <div class="p-4 form-side p-md-5 d-flex flex-column justify-content-center">
                        <div class="text-center mb-4">
                            <h1 class="fs-1">Bejelentkezés</h1>
                        </div>

                        <form @submit.prevent="onSubmit">
                            <FormInput v-model="username" label="Felhasználónév" type="text" placeholder="Add meg a felhasználóneved" required />

                            <FormInput v-model="password" label="Jelszó" type="password" placeholder="Add meg a jelszavad" required />


                            <button type="submit" class="btn btn-primary w-100 py-2">
                                Bejelentkezés
                            </button>

                            <div class="mt-3 d-flex justify-content-center">
                                <p class="pe-3">Nincs még fiókod?</p>
                                <NuxtLink to="register">Regisztráció</NuxtLink>
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
    border-top-right-radius: 12px;
    border-bottom-right-radius: 12px;
}

.card {
    max-width: 1200px;
    width: 100%;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.6);
}

a {
    color: #6f42c1!important;
    cursor: pointer;
    font-size: 15px;
    text-decoration: none;
}

.py{
    padding-top: 8rem;
}
</style>