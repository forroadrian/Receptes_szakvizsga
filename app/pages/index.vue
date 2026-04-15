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
            <div class="meal-section__inner">
                <h2 class="meal-section__title">Étkezések</h2>
                <p class="meal-section__lead">
                    Válassz étkezéstípus szerint, és fedezz fel hozzád illő recepteket, amelyek támogatják a céljaidat
                    a rohanós hétköznapoktól a nyugodtabb közös étkezésekig.
                </p>
                <div class="row meal-grid justify-content-center g-0">
                    <div class="col-12 col-sm-6 col-lg" v-for="item in categories" :key="item.name">
                        <div class="meal-card">
                            <div class="category-icon">
                                <i :class="item.icon"></i>
                            </div>
                            <h3 class="meal-card__title">{{ item.name }}</h3>
                            <p class="meal-card__text">{{ item.description }}</p>
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
                        <img src="/images/clock-plate.png" alt="Alapanyagok tányéron" title="ingredients-in-plate"
                            class="about-image" />
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

<style scoped>
.about-image-wrapper img {
    width: 70%;
}

.about-text {
    line-height: 1.8;
}

.about-content>div {
    border-left: 3px solid var(--yellow);
    padding-left: 30px;
}



.ourFeatures .col-lg-4 img {
    filter: drop-shadow(0 20px 60px var(--orange));
}

.hero-image {
    min-height: 500px;
    background-image: url('../assets/images/hero-img.png');
    background-size: 80%;
    background-repeat: no-repeat;
    background-position: center 40%;
    filter:
        drop-shadow(0 20px 30px rgba(255, 255, 255, 0.137)) drop-shadow(0 20px 50px rgba(255, 120, 0, 0.4)) drop-shadow(0 0 80px rgba(255, 150, 50, 0.35));
}

.hero::before {
    content: "";
    position: absolute;
    top: 30%;
    bottom: 20%;
    left: 0;
    right: 0;
    background: linear-gradient(to bottom, transparent 20%, rgba(255, 138, 70, 0.3) 35%, rgba(250, 97, 8, 0.356) 50%, transparent 0%);
    filter: blur(100px);
    pointer-events: none;
}

.meal-section {
    position: relative;
}

.meal-section__inner {
    position: relative;
    z-index: 1;
    max-width: 1180px;
    margin: 0 auto;
}

.meal-section__title {
    position: relative;
    display: inline-block;
    margin-bottom: 1rem;
    padding-bottom: 0.9rem;
}

.meal-section__title::after {
    content: "";
    position: absolute;
    left: 50%;
    bottom: 0;
    width: 108px;
    height: 3px;
    transform: translateX(-50%);
    border-radius: 999px;
    background: linear-gradient(90deg, rgba(250, 180, 100, 0.35), rgba(255, 114, 49, 0.95), rgba(250, 180, 100, 0.35));
    box-shadow: 0 0 10px rgba(255, 114, 49, 0.18);
}

.meal-section__lead {
    max-width: 760px;
    margin: 0 auto 3rem;
    font-size: 0.98rem;
    line-height: 1.7;
    color: var(--bs-secondary-color);
}

.meal-grid {
    align-items: stretch;
}

.meal-grid>div {
    position: relative;
}

.meal-grid>div:not(:last-child)::after {
    content: "";
    position: absolute;
    top: 1.25rem;
    right: 0;
    width: 1px;
    height: calc(100% - 2.5rem);
    background: linear-gradient(to bottom, transparent, rgba(33, 33, 33, 0.12), transparent);
}

.meal-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    padding: 1.5rem 1.25rem 0.5rem;
    text-align: center;
}

.category-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.2rem;
    transition: transform .18s ease;
}

.category-icon i,
.recipe-image i {
    width: 72px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30px;
    color: var(--orange);
    border: 1px solid rgba(240, 218, 194, 0.95);
    border-radius: 20px;
    background: linear-gradient(180deg, #fffdfb, #fffaf5);
    box-shadow:
        0 16px 18px rgba(85, 71, 58, 0.18),
        0 6px 12px rgba(255, 180, 100, 0.18),
        inset 0 2px 6px rgba(255, 255, 255, 0.95);
}

.meal-card__title {
    margin-bottom: 0.65rem;
    font-family: "Caveat Brush", cursive;
    font-size: 1.9rem;
    line-height: 1;
}

.meal-card__text {
    max-width: 220px;
    margin: 0;
    font-size: 0.92rem;
    line-height: 1.5;
    color: var(--bs-secondary-color);
}

[data-bs-theme="dark"] .meal-section__lead {
    color: rgba(255, 255, 255, 0.78);
}

[data-bs-theme="dark"] .meal-grid>div:not(:last-child)::after {
    background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.1), transparent);
}

[data-bs-theme="dark"] .category-icon i,
[data-bs-theme="dark"] .recipe-image i {
    color: #ffb15e;
    border: 1px solid rgba(255, 145, 44, 0.16);
    background: linear-gradient(180deg, rgba(46, 49, 53, 0.98), rgba(38, 41, 45, 0.98));
    box-shadow:
        0 10px 16px rgba(0, 0, 0, 0.18),
        0 0 0 1px rgba(255, 145, 44, 0.04),
        0 0 10px rgba(255, 174, 79, 0.12),
        0 0 18px rgba(255, 174, 79, 0.14),
        0 0 28px rgba(255, 174, 79, 0.08);
}

[data-bs-theme="dark"] .meal-card__title {
    color: #f4f4f4;
}

[data-bs-theme="dark"] .meal-card__text {
    color: rgba(255, 255, 255, 0.78);
}

.ourFeatures h2:before,
.ourFeatures h2:after {
    content: "";
    flex: 1 1;
    border-bottom: 2px solid var(--bs-emphasis-color);
    margin: auto 10px;

}

.ourFeatures {
    margin: 70px 0px;
}

.ourFeatures p {
    font-size: 14px;
    padding: 10px 60px;
}

.ourFeatures img {
    margin-bottom: 10px;
}

.card--base {
    color: var(--text-dark);
    background: var(--grad-yellow) border-box;
    opacity: 0.9;
    transition: all .25s ease;
}


@media (max-width: 992px) {
    .hero::before {
        background: linear-gradient(to right, transparent 0%, rgba(255, 138, 70, 0.3) 65%, rgba(250, 97, 8, 0.356) 50%, transparent 0%);
    }

    .hero-image {
        max-width: 600px;
        background-size: 70%;
    }

    .hero-image,
    .card--base,
    .about-content {
        margin: 0px auto;
    }

    .ourFeatures {
        margin-top: 100px;
    }

    .card--base {
        width: 80%;
    }

    .about-content {
        text-align: center;
    }

    .about-content>div {
        border: none;
    }

    .meal-grid>div:nth-child(2n)::after {
        display: none;
    }
}

@media (max-width: 767px) {
    .meal-section__lead {
        margin-bottom: 2rem;
    }

    .meal-grid>div::after {
        display: none;
    }

    .meal-card {
        padding: 1rem 0.75rem 1.5rem;
    }
}

@media (max-width: 576px) {

    .ourFeatures h2:before,
    .ourFeatures h2:after {
        border: none;
    }

    .meal-section__title {
        margin-bottom: 0.75rem;
    }

    .meal-card__title {
        font-size: 1.7rem;
    }

}
</style>