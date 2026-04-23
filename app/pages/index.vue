<script setup lang="ts">
import type { CardTagItem } from '~/interfaces/cardInterfaces/CardGenericInterfaces';
import { ref } from 'vue';
import { computed } from 'vue';


const user = useSupabaseUser();
const {t, locale, locales, setLocale} = useI18n({
    useScope: 'global',
})

const ingredientsButtonTo = computed(() => {
    return user.value ? "/ingredients" : "/login"
})

const goToRecipes = async (mealName: string) => {
    const prev = locale.value
    await setLocale('hu')
    const route: string = '/recipes?meal=' + $t('home.meals.categories.'+mealName+".name")
    navigateTo(route);
    await setLocale(prev)
};

const categories = [
    {
        name: "all",
        icon: "bi bi-three-dots",
    },
    {
        name: "breakfast",
        icon: "bi bi-sun",
    },
    {
        name: "lunch",
        icon: "bi bi-egg-fried",
    },
    {
        name: "dinner",
        icon: "bi bi-moon",
    },
    {
        name: "snack",
        icon: "bi bi-cookie",
    },
]

const tagsFirstCard: CardTagItem[] = [
    { label: 'Ebéd', variant: 'active' },
    { label: 'Sós', variant: 'outline' },
    { label: 'Tovább...', variant: 'greyed' },
]

const thingsThatMakeUsStandOut = [
    {
        id: "easyRecipes",
        img: "/icons/cooking.png"
    },
    {
        id : "saveTime",
        img: "/icons/clock.png"
    },
    {
        id: "menuPlanning",
        img: "/icons/calendar.png"
    },
    {
        id: 'pantryManagement',
        img: "/icons/ingredient.png"
    },
    {
        id: 'varietyMeals',
        img: "/icons/peking-duck.png"
    },
    {
        id: 'personalization',
        img: '/icons/man.png'
    }
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
                    <span class="badge dark border rounded-pill px-3 py-2 mb-3">{{ $t('home.hero.badge') }}</span>
                    <h2>{{ $t('home.hero.title') }}</h2>
                    <p class="py-4">
                        {{ $t('home.hero.lead') }}
                    </p>
                    <div class="d-flex flex-wrap gap-2">
                        <Button to="/recipes" color="yellow" icon="bi bi-arrow-right" iconPosition="right">{{$t('home.hero.browseRecipes')}}</Button>
                        <Button :to="ingredientsButtonTo" color="orange outline" icon="bi bi-basket3"
                            iconPosition="right">{{ $t('home.hero.myPantry') }}</Button>
                    </div>
                </div>
                <div class="col-lg-5 hero-image d-flex"></div>
            </div>
        </div>
    </section>

    <section class="meal-section py-5">
        <div class="container text-center">
            <div class="meal-section-inner">
                <h2 class="meal-section-title">{{ $t('home.meals.title') }}</h2>
                <p class="meal-section-lead">{{ $t('home.meals.lead') }}</p>
                <div class="row meal-grid justify-content-center g-0">
                    <div class="col-12 col-sm-6 col-lg" v-for="item in categories" :key="item.name">
                        <div class="meal-card" @click="goToRecipes(item.name)">
                            <div class="category-icon">
                                <i :class="item.icon"></i>
                            </div>
                            <h3 class="meal-card-title">{{ $t('home.meals.categories.' + item.name + '.name') }}</h3>
                            <p class="meal-card-text">{{ $t('home.meals.categories.' + item.name + '.description') }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="ourFeatures">
        <div class="container-fluid px-5">
            <h2 class="text-center d-flex">{{ $t('home.features.title') }}</h2>
            <div class="row flex flex-wrap text-center py-4">
                <div class="col-lg-4 col-md-6 col-sm-12 p-4" v-for="(thing, index) in thingsThatMakeUsStandOut" :key="index">
                    <div>
                        <img :src="thing.img" :alt="$t('home.features.'+thing.id+'.title')">
                    </div>
                    <h3>{{ $t('home.features.'+thing.id+'.title') }} </h3>
                    <p><strong>{{ $t('home.features.easyRecipes.body', {strong: $t('home.features.easyRecipes.strong')}) }}</strong>
                    </p>
                </div>
            </div>
        </div>
    </section>

    <section class="topRecipe">
        <div class="container">
            <h4 class="text-center grad-text text-orange">{{ $t('home.topRecipes.subhead') }}</h4>
            <h2 class="text-center">{{ $t('home.topRecipes.title') }}</h2>
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
                                <strong><i class="bi bi-exclamation-triangle-fill me-3 fs-5"></i> {{ $t('home.topRecipes.containsAllergen'), {allergen: card.allergen} }}</strong>
                            </p>
                        </template>
                    </CardBase>
                </div>
                <div class=" col-lg-6 col-md-12 col-sm-12 moreRecipeBtn mt-lg-5 mx-auto">
                    <ClientOnly>
                        <Button to="/recipes" icon="bi bi-arrow-right" iconPosition="right" class="my-5">{{ $t('home.topRecipes.ctaMore') }}</Button>
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
                        <NuxtImg src="/images/clock-plate.png" :alt="$t('home.about.imageAlt')" :title="$t('home.about.imageTitle')"
                            class="about-image" :width="500" :height="500" format="webp" preload loading="eager" fetchpriority="high" densities="x1 x1" />
                    </div>
                </div>
                <div class="col-12 col-lg-6 about-content">
                    <h4 class="grad-text text-orange">
                        {{ $t('home.about.quote') }}
                    </h4>
                    <h2 class="about-title mb-3">{{ $t('home.about.title') }}</h2>
                    <div>
                        <p class="about-text">
                            {{ $t('home.about.p1', { strong: $t('home.about.p1Strong') }) }}
                        </p>
                        <p class="about-text">
                            {{ $t('home.about.p2', { strong: $t('home.about.p2Strong') }) }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped src="~/assets/css/index.css"></style>