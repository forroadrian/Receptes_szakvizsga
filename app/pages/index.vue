<script setup lang="ts">
import { ref, computed } from 'vue';

type FeaturedRecipe = {
    id: number;
    name: string;
    description: string;
    likes: number;
    saves: number;
    time: number;
    servings: number;
    categories: Array<{ id: number; name: string; group_type: string }>;
    allergies: Array<{ id: number; name: string }>;
};

const user = useSupabaseUser();
const { t } = useI18n({
    useScope: 'global',
})
const { getRecipeImage } = useRecipeImage()

const ingredientsButtonTo = computed(() => {
    return user.value ? "/ingredients" : "/login"
})

const { data: featuredRecipes } = await useAsyncData<FeaturedRecipe[]>(
    'featured-recipes',
    () => $fetch('/api/recipe/featured'),
    { default: () => [] }
)

const goToRecipes = (mealName: string) => {
    const huName = t(`home.meals.categories.${mealName}.name`, {}, { locale: 'hu' })
    navigateTo(`/recipes?meal=${huName}`)
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

</script>

<template>
    <section class="hero">
        <div class="hero-blob hero-blob-left" aria-hidden="true"></div>
        <div class="hero-blob hero-blob-right" aria-hidden="true"></div>
        <div class="hero-dot hero-dot-1" aria-hidden="true"></div>
        <div class="hero-dot hero-dot-2" aria-hidden="true"></div>
        <div class="hero-dot hero-dot-3" aria-hidden="true"></div>
        <div class="container hero-content">
            <div class="row align-items-center gy-4">
                <div class="col-12 col-lg-7 hero-copy">
                    <span class="badge border rounded-pill px-3 py-2 mb-3">{{ $t('home.hero.badge') }}</span>
                    <h2>{{ $t('home.hero.title') }}</h2>
                    <p class="py-4">
                        {{ $t('home.hero.lead') }}
                    </p>
                    <div class="d-flex flex-wrap gap-2 hero-actions">
                        <Button to="/recipes" icon="bi bi-arrow-right" iconPosition="right">{{$t('home.hero.browseRecipes')}}</Button>
                        <Button :to="ingredientsButtonTo" color="orange outline" icon="bi bi-basket3"
                            iconPosition="right">{{ $t('home.hero.myPantry') }}</Button>
                    </div>
                </div>
                <div class="col-12 col-lg-5 hero-visual">
                    <div class="hero-image d-flex" role="img" :aria-label="$t('home.hero.imageAlt')"></div>
                </div>
            </div>
        </div>

        <div class="custom-shape-divider-bottom-1776970496" aria-hidden="true">
            <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" class="shape-fill"></path>
                <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" class="shape-fill"></path>
                <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" class="shape-fill"></path>
            </svg>
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
                        <NuxtImg loading="lazy" :src="thing.img" :alt="$t('home.features.'+thing.id+'.title')" />
                    </div>
                    <h3>{{ $t('home.features.'+thing.id+'.title') }} </h3>
                    <p><strong>{{ $t('home.features.'+thing.id+'.body', {strong: $t('home.features.'+thing.id+'.strong')}) }}</strong>
                    </p>
                </div>
            </div>
        </div>
    </section>

    <section class="topRecipe" v-if="featuredRecipes && featuredRecipes.length">
        <div class="container">
            <h4 class="text-center grad-text text-orange">{{ $t('home.topRecipes.subhead') }}</h4>
            <h2 class="text-center">{{ $t('home.topRecipes.title') }}</h2>
            <div class="row">
                <div class="col-lg-4 col-md-6 col-sm-12 px-3 my-5 mx-auto"
                     v-for="(recipe, index) in featuredRecipes" :key="recipe.id">
                    <NuxtLink :to="`/recipe/${recipe.id}`" class="text-decoration-none text-reset h-100 d-block">
                        <CardBase variant="subtle" media-position="top" tags-position="above"
                            :class="{ 'mt-lg-5': index != 1 }" show-divider class="h-100 featured-recipe-card">
                            <template #media>
                                <div class="d-flex align-items-center justify-content-center featured-recipe-media">
                                    <img :src="getRecipeImage(recipe)" :alt="recipe.name" />
                                </div>
                            </template>

                            <template v-if="index === 0" #badge>
                                <span class="badge dark rounded-pill px-4 py-2">
                                    {{ $t('home.topRecipes.mostPopular') }}
                                </span>
                            </template>

                            <template #header>
                                <CardHeader>
                                    <CardTitle :rank="3">{{ recipe.name }}</CardTitle>
                                </CardHeader>
                            </template>

                            <template #body>
                                <p class="text-center featured-recipe-description">
                                    {{ recipe.description }}
                                </p>
                            </template>

                            <template v-if="recipe.allergies?.length" #footer>
                                <p class="text-center mb-0">
                                    <strong>
                                        <i class="bi bi-exclamation-triangle-fill me-3 fs-5"></i>
                                        {{ $t('home.topRecipes.containsAllergen', { allergen: recipe.allergies.map(a => a.name).join(', ') }) }}
                                    </strong>
                                </p>
                            </template>
                        </CardBase>
                    </NuxtLink>
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
                            class="about-image" format="webp" preload loading="eager" fetchpriority="high" densities="x1 x1" />
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