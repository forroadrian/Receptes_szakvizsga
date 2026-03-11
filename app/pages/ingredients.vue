<script setup lang="ts">
import type SearchParams from "~/interfaces/SearchParams";
import Ingredient from "~/models/Ingredient";

const showStats = ref<boolean>(false);

const ingredients: Ingredient[] = [
    new Ingredient("alma", 10, "kg"),
    new Ingredient("körte", 10, "dkg"),
    new Ingredient("Tej", 2, "l"),
];

const params = ref<SearchParams<Ingredient>>({
    haystack: ingredients,
    searchFor: ["name"],
    showAllByDefault: true
});

const results = useSearch(params);

const showIngredientModal = ref(false);

const newIngredient = ref({
    name: "",
    amount: null as number | null,
    unit: "",
    expiresAt: "",
});

</script>

<template>
    <div class="container mt-3">
        <div class="row mb-3">
            <h1 class="col-12">Alapanyagok</h1>
            <p class="col-lg-8 col-sm-12 pe-4 text-wrap">
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Omnis officia
                voluptatibus similique inventore assumenda quia accusantium minima
                deserunt veniam qui ut, a corrupti exercitationem, itaque tempore saepe
                sed sapiente nobis!
            </p>

            <Button class="col-lg-4 col-10 m-auto align-self-center" icon="bi bi-plus" type="button" color="dark">Új
                hozzávaló hozzáadása</Button>
            <Button class="d-md-none col-1 border-2" outline color="dark" icon="bi bi-graph-up" iconPosition="left"
                icon-only type="button" data-bs-toggle="collapse" data-bs-target="#statsCollapse">
            </Button>
        </div>
        <div id="statsCollapse" class="collapse d-md-block pb-4 border-bottom mt-4 mt-md-0">
            <div class="row row-gap-4 justify-content-between text-center">
                <div class="col-lg-3 col-md-6 mb-md-0">
                    <IngredientCardAmount :amount="0" image="/logo.png" description="Összes" class="mx-auto" />
                </div>
                <div class="col-lg-3 col-md-6 mb-md-0">
                    <IngredientCardAmount :amount="0" image="/logo.png" description="Friss" class="mx-auto" />
                </div>
                <div class="col-lg-3 col-md-6 mb-md-0">
                    <IngredientCardAmount :amount="0" image="/logo.png" description="Hamarosan Lejár" class="mx-auto" />
                </div>
                <div class="col-lg-3 col-md-6">
                    <IngredientCardAmount :amount="0" image="/logo.png" description="Lejárt" class="mx-auto" />
                </div>
            </div>
        </div>
        <div class="row mt-4">
            <h2>Meglébő alapanyagaim</h2>
            <SearchBar v-model="params.query" placeholder="Keresés" />
            <div>
                <h3 class="fs-3 mt-3">Találatok az alábbi keresésre:</h3>
                <div class="row g-3 mb-5 mt-4">
                    <div class="pe-1 col-12 col-sm-6 col-md-4 col-lg-3 d-flex justify-content-center"
                        v-for="ingredient in results">
                        <IngredientCardAmount :amount="ingredient.amount" image="/logo.png" class="w-100"
                            :description="ingredient.name" />
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<style scoped>

</style>
