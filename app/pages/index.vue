<script setup lang="ts">
import type { CardTagItem } from '~/interfaces/cardInterfaces/CardGenericInterfaces';
import { ref } from 'vue';
import { computed } from 'vue';

const user = useSupabaseUser()

const ingredientsButtonTo = computed(() => {
    return user.value ? "/ingredients" : "/login"
})

const categories = [
    {
        name: "Összes",
        icon: "bi bi-three-dots",
        description: "Böngészd át egy helyen az összes inspiráló receptötletet."
    },
    {
        name: "Reggeli",
        icon: "bi bi-sun",
        description: "Indítsd jól a napot tartalmas, lendületes reggelikkel."
    },
    {
        name: "Ebéd",
        icon: "bi bi-egg-fried",
        description: "Laktató és kiegyensúlyozott fogások a nap közepére."
    },
    {
        name: "Vacsora",
        icon: "bi bi-moon",
        description: "Könnyű vagy kiadós ötletek az esti közös étkezésekhez."
    },
    {
        name: "Snack",
        icon: "bi bi-cookie",
        description: "Gyors harapnivalók két étkezés között vagy útközben."
    },
]

const tagsFirstCard: CardTagItem[] = [
    { label: 'Ebéd', variant: 'active' },
    { label: 'Sós', variant: 'outline' },
    { label: 'Tovább...', variant: 'greyed' },
]

const cards = ref([
    {
        id: 1,
        title: 'Lorem ipsum dolor sit',
        description: 'Accusantium doloremque laudantium, totam rem aperiam eaque.',
        badge: 'Kipróbált',
        allergen: 'Búzafélék',
    },
    {
        id: 2,
        title: 'Lorem ipsum dolor sit amet',
        description: 'Ez egy másik leírás, teljesen eltérő tartalommal.',
        badge: 'Kipróbált',
        allergen: 'Tej',
    },
    {
        id: 3,
        title: 'Lorem ipsum dolor sit amet',
        description: 'Itt is egyedi szöveg jelenik meg a kártyán.',
        badge: 'Tervezett',
        allergen: 'Tojás',
    }
])
</script>

<template>
    <section class="hero">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-12 col-lg-7 my-5">
                    <span class="badge dark border rounded-pill px-3 py-2 mb-3">✨ Tudatos étkezés,
                        könnyedén</span>
                    <h2>Tervezd meg az étrendedet!</h2>
                    <p class="py-4">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                        labore et dolore magna aliqua.
                    </p>
                    <div class="d-flex flex-wrap gap-2">
                        <Button to="/recipes" color="yellow" icon="bi bi-arrow-right" iconPosition="right">Receptek
                            megtekintése</Button>
                        <Button :to="ingredientsButtonTo" color="orange outline" icon="bi bi-basket3"
                            iconPosition="right">Alapanyagaim</Button>
                    </div>
                </div>
                <div class="col-lg-5 hero-image d-flex"></div>
            </div>
        </div>
    </section>

    <section class="meal-section py-5">
        <div class="container text-center">
            <div class="meal-section-inner">
                <h2 class="meal-section-title">Étkezések</h2>
                <p class="meal-section-lead">
                    Válassz étkezéstípus szerint, és fedezz fel hozzád illő recepteket, amelyek támogatják a céljaidat
                    a rohanós hétköznapoktól a nyugodtabb közös étkezésekig.
                </p>
                <div class="row meal-grid justify-content-center g-0">
                    <div class="col-12 col-sm-6 col-lg" v-for="item in categories" :key="item.name">
                        <div class="meal-card">
                            <div class="category-icon">
                                <i :class="item.icon"></i>
                            </div>
                            <h3 class="meal-card-title">{{ item.name }}</h3>
                            <p class="meal-card-text">{{ item.description }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="ourFeatures">
        <div class="container-fluid px-5">
            <h2 class="text-center d-flex">Miért válassz minket?</h2>
            <div class=" row flex flex-wrap text-center py-4">
                <div class="col-lg-4 col-md-6 col-sm-12 p-4">
                    <div>
                        <img src="../assets/icons/cooking.png" alt="">
                    </div>
                    <h3>Könnyű receptek </h3>
                    <p><strong>Pár lépésből elkészíthető ételek</strong>, amelyek egyszerűbbé teszik a
                        mindennapokat.
                    </p>
                </div>
                <div class="col-lg-4 col-md-6 col-sm-12 p-3">
                    <div>
                        <img src="../assets/icons/clock.png" alt="">
                    </div>
                    <h3>Időspórolás</h3>
                    <p>Nem kell azon aggódnod, hogy mit főzz és mikor, így <strong>több időd marad</strong> az igazán
                        fontos dolgokra.
                    </p>
                </div>
                <div class="col-lg-4 col-md-6 col-sm-12 p-3">
                    <div>
                        <img src="../assets/icons/calendar.png" alt="">
                    </div>
                    <h3>Menütervezés </h3>
                    <p><strong>Tervezd meg az étkezéseidet</strong> néhány kattintással, hogy teljesen átláthatóak
                        legyenek számodra.
                    </p>
                </div>
                <div class="col-lg-4 col-md-6 col-sm-12 p-3">
                    <div>
                        <img src="../assets/icons/ingredient.png" alt="">
                    </div>
                    <h3>Alapanyagok kezelése</h3>
                    <p>A <strong>meglévő alapanyagok</strong> megadásával fedezz fel recepteket, amelyeket már most
                        elkészíthetsz.
                    </p>
                </div>
                <div class="col-lg-4 col-md-6 col-sm-12 p-3">
                    <div>
                        <img src="../assets/icons/peking-duck.png" alt="">
                    </div>
                    <h3>Változatos étkezések</h3>
                    <p>Inspiráló receptek <strong>reggelire, ebédre és vacsorára</strong>, hogy minden nap új ízek
                        kerülhessenek az
                        asztalra.</p>
                </div>
                <div class="col-lg-4 col-md-6 col-sm-12 p-3">
                    <div>
                        <img src="../assets/icons/man.png" alt="">
                    </div>
                    <h3>Személyre szabhatóság</h3>
                    <p><strong>Allergia? Ételérzékenység?</strong> - Nálunk megtalálod azokat a recepteket amelyek
                        megfelelnek az
                        igényeidnek. </p>
                </div>
            </div>
        </div>
    </section>

    <section class="topRecipe">
        <div class="container">
            <h4 class="text-center grad-text text-orange">Ajánlatunk</h4>
            <h2 class="text-center">Legfelkapottabb receptek</h2>
            <div class="row">
                <div class="col-lg-4 col-md-6 col-sm-12 px-3 my-5 mx-auto" v-for="(card, index) in cards">
                    <CardBase variant="subtle" media-position="top" tags-position="above"
                        :class="{ 'mt-lg-5': index != 1 }" show-divider class="h-100">
                        <template #media>
                            <div class="d-flex align-items-center justify-content-center w-100 h-100">
                                <span>📷</span>
                            </div>
                        </template>

                        <template #badge>
                            <span class="badge dark rounded-pill px-4 py-2">
                                {{ card.badge }}
                            </span>
                        </template>

                        <template #header>
                            <CardHeader>
                                <CardTitle :rank="3">{{ card.title }}</CardTitle>
                            </CardHeader>
                        </template>

                        <template #body>
                            <p class="text-center">
                                {{ card.description }}
                            </p>
                        </template>

                        <template #footer>
                            <p class="text-center mb-0">
                                <strong><i class="bi bi-exclamation-triangle-fill me-3 fs-5"></i> Allergént tartalmaz:
                                    {{ card.allergen }}</strong>
                            </p>
                        </template>
                    </CardBase>
                </div>
                <div class=" col-lg-6 col-md-12 col-sm-12 moreRecipeBtn mt-lg-5 mx-auto">
                    <ClientOnly>
                        <Button to="/recipes" icon="bi bi-arrow-right" iconPosition="right" class="my-5">Keress
                            további
                            recepteket</Button>
                    </ClientOnly>
                </div>
            </div>
        </div>
    </section>

    <section class="aboutProject my-5 py-4">
        <div class="container-fluid">
            <div class="row align-items-center">
                <div class="col-12 col-lg-6">
                    <div class="about-image-wrapper d-flex justify-content-center">
                        <NuxtImg src="/images/clock-plate.png" alt="Alapanyagok tányéron" title="Alapanyagok egy tányéron"
                            class="about-image" :width="500" :height="500" format="webp" preload loading="eager" fetchpriority="high" densities="x1 x1" />
                    </div>
                </div>
                <div class="col-12 col-lg-6 about-content">
                    <h4 class="grad-text text-orange">
                        ,, Mit főzzek a hétvégére? "
                    </h4>
                    <h2 class="about-title mb-3">A projekt célja</h2>
                    <div>
                        <p class="about-text">
                            Fontos számunkra, hogy felhasználóink akár már az otthon megtalálható alapanyagokból is
                            <strong>gondolkodás nélkül, gyorsan és egyszerűen</strong>
                            tudjanak ételeket készíteni.
                        </p>
                        <p class="about-text">
                            Számtalan receptből válogathatnak, saját ízlésüknek megfelelően:
                            <strong>kereshetnek, tervezhetnek</strong> szabadon.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped src="~/assets/css/index.css"></style>