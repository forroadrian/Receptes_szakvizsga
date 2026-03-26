<script setup lang="ts">
definePageMeta({
    middleware: "auth-only",
});
import { storeToRefs } from "pinia";
import Modal from "~/components/Ingredient/Modal.vue";
import type SearchParams from "~/interfaces/SearchParams";
import Ingredient from "~/models/Ingredient";
import { useIngredientStore } from "~/stores/ingredients";

const ingredientState = useIngredientStore();

const {showIngredientModal, ingredients} = storeToRefs(ingredientState)
const {
    units,
    openIngredientModal,
    loadIngredients,
    removeIngredient
} = ingredientState

const isAlert = ref<boolean>(false);
const loadingData = ref<boolean>(false);

const showModal = computed(() => showIngredientModal.value);
const userHasIngredients = computed(() => ingredients.value.length > 0)

const descriptionText = computed(() => {
    if(loadingData.value) return "Az adatok betöltése folyamatban van";
    if(!userHasIngredients.value) return "Még nem adtál hozzá semmit";
    if(results.value.length == 0) return "Sajnos nem találtunk ilyen alapanyagot :(";
    return "Ismeretlen hiba";
})

const params = ref<SearchParams<Ingredient>>({
    haystack: ingredients.value as Ingredient[],
    searchFor: ["name"],
    showAllByDefault: true,
});


const results = useSearch(params);

function showAlert(){
    isAlert.value = true;
}

const onDelete = async (ingredient: Ingredient) => {
    try {
        removeIngredient(ingredient.id);
    } catch(error) {
        showAlert();
    }
};

const onEdit = (ingredient: Ingredient) => {

};

onMounted(async () => {
    loadingData.value = true;
    try {
        loadIngredients()    
    } finally {
        loadingData.value = false;
    }
})
</script>

<template>
    <div class="container mt-3 py-3">
        <div class="row mb-3 py-3 mx-sm-auto">
            <h1 class="col-12 py-3">Alapanyagaim</h1>
            <p class="col-lg-8 col-sm-12 pe-4 text-wrap">
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Omnis officia
                voluptatibus similique inventore assumenda quia accusantium minima
                deserunt veniam qui ut, a corrupti exercitationem, itaque tempore saepe
                sed sapiente nobis!
            </p>
            <IngredientButtons @openIngredientModal="openIngredientModal"/>
        </div>
        <IngredientStatCards />
        <div class="row mt-4">
            <h2 class="py-3">Meglévő alapanyagaim</h2>
            <SearchBar v-model="params.query" placeholder="Keresés" class="px-3 mx-3" />
            <div>
                <h5 class="mt-3 py-3">Találatok az alábbi keresésre:</h5>
                <IngredientList :results="results" @delete="onDelete", :loading="loadingData" :description="descriptionText"/>
            </div>
        </div>
    </div>
    <Modal v-if="showModal"/>
    
    <Alert message="Helytelen adat." :show="isAlert" type="error" @close="isAlert = false" />
</template>

<style>
.card--base {
    padding: 0;
}
</style>

<style scoped>
.card--wrapper-media {
    min-width: 80px;
}

@media (min-width: 992px) {
    .ingredient-modal-backdrop {
        justify-content: flex-end;
        align-items: flex-start;
        padding: 32px 40px;
    }

    .ingredient-modal-panel {
        max-width: 420px;
    }
}
</style>
