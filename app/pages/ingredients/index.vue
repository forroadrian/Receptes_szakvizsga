<script setup lang="ts">
definePageMeta({
    middleware: "auth-only",
});
import { storeToRefs } from "pinia";
import type SearchParams from "~/interfaces/SearchParams";
import Ingredient from "~/models/Ingredient";
import { useIngredientStore } from "~/stores/ingredients";

const store = useIngredientStore();

const { ingredients } = storeToRefs(store)
const { loadIngredients, loadAvailableIngredients, removeIngredient } = store

const alert = ref(false);
const loading = ref(false);

const hasItems = computed(() => ingredients.value.length > 0)

const description = computed(() => {
    if (loading.value) return "Az adatok betöltése folyamatban van";
    if (!hasItems.value) return "Még nem adtál hozzá semmit";
    if (results.value.length == 0) return "Sajnos nem találtunk ilyen alapanyagot :(";
    return "Ismeretlen hiba";
})

const fresh = computed(() => ingredients.value.filter(v => v.tag === "Friss").length)
const expiring = computed(() => ingredients.value.filter(v => v.tag === "Hamarosan").length)
const expired = computed(() => ingredients.value.filter(v => v.tag === "Lejárt").length)
const query = ref<string[]>([])

const params = computed<SearchParams<Ingredient>>(() => ({
    haystack: ingredients.value as Ingredient[],
    searchFor: ["name", "tag"],
    showAllByDefault: true,
    query: query.value
}));

const results = useSearch(params);

const addToQuery = (tag: string) => {
    query.value[1] = tag === "Összes" ? "" : tag;
}

const onDelete = async (ingredient: Ingredient) => {
    try {
        removeIngredient(ingredient.id);
    } catch {
        alert.value = true;
    }
};

onMounted(async () => {
    loading.value = true;
    try {
        await Promise.all([loadIngredients(), loadAvailableIngredients()])
        addToQuery("Összes")
    } finally {
        loading.value = false;
    }
})
</script>

<template>
    <div class="page">
        <div class="layout">

            <section class="sidebar">
                <div class="d-flex flex-column h-100">
                    <div class="hero-wrap d-none d-lg-block position-relative overflow-hidden">
                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSLN9jlsLxNa9URKbO2qra2TdszoSHF40m1iZ4-wleCqrlPDTZF5fly-No8zHGvm27CwIm1YPGnadC2OOTmr9t9eZt3Og_UePN1KtlkN1qIaCIw_2__B6Lcxfhc82McJfnVOU-hW6kPd4O5RW5TpBiDt8N6nAEG1T_5_KoVuOSVuWlh3vTKffb03SuuOmxPW02m7FZ26AfZTzyygW3geWL--ncrAyIr9Y-ZMRlySDQRkxhnmO-2QhU8wsrITA85nSBOKhc7os7X-Y"
                            alt="Friss zöldségek és hozzávalók"
                            class="position-absolute top-0 start-0 w-100 h-100 object-fit-cover" />
                        <div class="hero-overlay position-absolute top-0 start-0 w-100 h-100"></div>
                        <div class="hero-text position-absolute z-1">
                            <h1 class="hero-title text-uppercase">A te<br>kamrád</h1>
                            <p class="hero-sub m-0 fw-semibold">{{ ingredients.length }} alapanyag nyilvántartva</p>
                        </div>
                    </div>

                    <div class="summary flex-grow-1">
                        <div class="mb-3">
                            <h3 class="summary-title m-0 fw-bold text-uppercase">Összefoglaló</h3>
                        </div>
                        <div class="stats d-flex flex-column">
                            <div class="stat stat-fresh d-flex align-items-baseline">
                                <span class="stat-num lh-1">{{ fresh }}</span>
                                <span class="stat-text fw-medium">Friss</span>
                            </div>
                            <div class="stat stat-warning d-flex align-items-baseline">
                                <span class="stat-num lh-1">{{ expiring }}</span>
                                <span class="stat-text fw-medium">Hamarosan lejár</span>
                            </div>
                            <div class="stat stat-expired d-flex align-items-baseline">
                                <span class="stat-num lh-1">{{ expired }}</span>
                                <span class="stat-text fw-medium">Lejárt</span>
                            </div>
                        </div>
                    </div>

                    <NuxtLink to="/ingredients/add"
                        class="add-link d-flex align-items-center justify-content-between text-decoration-none overflow-hidden position-relative">
                        <div class="position-relative z-1">
                            <p class="add-label fw-bold">Hiányzik valami?</p>
                            <h3 class="add-title m-0">Új alapanyag hozzáadása</h3>
                        </div>
                    </NuxtLink>
                </div>
            </section>

            <section class="main">
                <div class="main-inner w-100">
                    <header class="main-head">
                        <h2 class="main-title fw-bold">Alapanyagaim</h2>
                        <p class="main-desc m-0 text-secondary">Böngészd és szűrd a kamrádban lévő hozzávalókat.</p>
                    </header>

                    <SearchBar v-model="query[0]" placeholder="Keress alapanyag nevére..." />
                    <IngredientStatCards :all="ingredients.length" :fresh="fresh" :almostExpired="expiring"
                        :expired="expired" @filter="addToQuery" />
                    <IngredientList :results="results" @delete="onDelete" @edit="" :loading="loading"
                        :description="description" :hasIngredients="hasItems" />
                </div>
            </section>

        </div>
    </div>

    <Alert message="Helytelen adat." :show="alert" type="error" @close="alert = false" />
</template>

<style>
.card--base {
    padding: 0;
}
</style>

<style scoped>
@import '~/assets/css/ingredientIndex.css';
</style>
