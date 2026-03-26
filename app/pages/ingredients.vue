<script setup lang="ts">
definePageMeta({
    middleware: "auth-only",
});
import { storeToRefs } from "pinia";
import type SearchParams from "~/interfaces/SearchParams";
import ExpiryDate from "~/models/ExpiryDate";
import Ingredient from "~/models/Ingredient";
import { useIngredientStore } from "~/stores/ingredients";

const ingredientState = useIngredientStore();

const {showIngredientModal, ingredients} = storeToRefs(ingredientState)
const {
    units,
    openIngredientModal,
    closeIngredientModal,
    loadIngredients,
    pushIngredient,
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

const newIngredient = ref({
    name: "",
    quantity: null as number | null,
    unit: "",
    expiry: "",
});
const results = useSearch(params);

function showAlert(){
    isAlert.value = true;
}

const checkInput = () => 
        newIngredient.value.name.length === 0 ||
        newIngredient.value.unit === "" ||
        newIngredient.value.expiry.length === 0 ||
        newIngredient.value.quantity == null ||
        newIngredient.value.quantity <= 0

const resetInputData = () => {
    newIngredient.value = {
        name: "",
        quantity: null,
        unit: "",
        expiry: "",
    };
}

const saveIngredient = async () => {
    console.log("save clicked");
    if (checkInput()) {
        showAlert()
        return;
    }
    try {
        newIngredient.value.name = normalizeIngredientName(newIngredient.value.name);
        const expiry = new ExpiryDate(new Date(newIngredient.value.expiry))
        
        const res:any  = await $fetch('api/ingredient', {
            method: "POST",
            body: {
                name: newIngredient.value.name,
                unit: newIngredient.value.unit,
                quantity: newIngredient.value.quantity,
                expiry: newIngredient.value.expiry
            }
        })
        const ing = new Ingredient(res.ingredient_id, newIngredient.value.name, res.quantity, res.unit, expiry, expiry.checkExpiry())
    
        pushIngredient(ing);
        resetInputData();
        closeIngredientModal();
        
    } catch(error: any) {
        showAlert();
    }
};

const onDelete = async (ingredient: Ingredient) => {
    try {
        removeIngredient(ingredient.id);
        await $fetch('/api/ingredient', {
            method: 'DELETE',
            body: {
                id: ingredient.id
            }
        })
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
            <h1 class="col-12 py-3">Itt mar ennek kell megjelennie</h1>
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

    <div v-if="showIngredientModal" class="ingredient-modal-backdrop" @click.self="closeIngredientModal">
        <div class="ingredient-modal-panel">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3 class="mb-0">Új hozzávaló felvétele</h3>
                <i class="bi bi-x p-0" @click="closeIngredientModal"></i>
            </div>

            <div class="mb-3">
                <label class="form-label">Hozzávaló megnevezése</label>
                <input v-model="newIngredient.name" type="text" class="form-control" placeholder="Pl. Tej" />
            </div>

            <div class="row g-2 mb-3">
                <div class="col-7">
                    <label class="form-label">Mennyiség</label>
                    <input v-model.number="newIngredient.quantity" type="number" class="form-control"
                        placeholder="100" />
                </div>
                <div class="col-5">
                    <label class="form-label">Egység</label>
                    <select class="form-select" v-model="newIngredient.unit">
                        <option v-for="unit in units" :value="unit">{{ unit }}</option>
                    </select>
                </div>
            </div>

            <div class="mb-4">
                <label class="form-label">Lejárati idő</label>
                <input v-model="newIngredient.expiry" type="date" class="form-control" />
            </div>

            <div class="d-flex justify-content-end">
                <Button color="dark" type="button" @click="saveIngredient">
                    MENTÉS
                </Button>
            </div>
        </div>
    </div>

    <Alert message="Helytelen adat." :show="isAlert" type="error" @close="isAlert = false" />
</template>

<style>
.card--base {
    padding: 0;
}
</style>

<style scoped>
.ingredient-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1050;
}

.ingredient-modal-panel {
    background: var(--bs-body-bg);
    border-radius: 24px;
    padding: 24px 28px;
    width: 100%;
    max-width: 420px;
    box-shadow: 0 18px 45px rgba(0, 0, 0, 0.25);
}

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
