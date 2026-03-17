<script setup lang="ts">
import type SearchParams from "~/interfaces/SearchParams";
import Ingredient from "~/models/Ingredient";


const showAlert = ref<boolean>()

const colorMode = useColorMode()

const buttonColor = computed(() => {
    if (colorMode.value === "dark") return "soft"
    return "dark"
})

const ing = new Ingredient(1, "alma", 10, "kg")
ing.tag = "Hamarosan Lejár"

const ingredients: Ingredient[] = [
    ing,
    new Ingredient(2, "körte", 10, "dkg"),
    new Ingredient(3, "Tej", 2, "l"),
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

function openIngredientModal() {
    showIngredientModal.value = true;
}

function closeIngredientModal() {
    showIngredientModal.value = false;
}

function saveIngredient() {
    const currentNew = newIngredient.value
    if (currentNew.name.length == 0 || currentNew.amount == null || currentNew?.amount < 0 || currentNew.unit.length == 0 || currentNew.expiresAt.length == 0) {
        showAlert.value = true
        return;
    }
    const ing = new Ingredient(-1, currentNew.name, currentNew.amount, currentNew.unit)
    ingredients.push(ing)

    closeIngredientModal();
}

</script>

<template>
    <div class="container mt-3">
        <div class="row mb-3">
            <h1 class="col-12">Itt mar ennek kell megjelennie</h1>
            <p class="col-lg-8 col-sm-12 pe-4 text-wrap">
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Omnis officia
                voluptatibus similique inventore assumenda quia accusantium minima
                deserunt veniam qui ut, a corrupti exercitationem, itaque tempore saepe
                sed sapiente nobis!
            </p>

            <Button class="col-lg-4 col-10 m-auto align-self-center" icon="bi bi-plus" type="button"
                :color="buttonColor" @click="openIngredientModal">Új
                hozzávaló hozzáadása</Button>
            <Button class="d-md-none col-1 border-2" outline color="dark" icon="bi bi-graph-up" iconPosition="left"
                icon-only type="button" data-bs-toggle="collapse" data-bs-target="#statsCollapse">
            </Button>
        </div>
        <div id="statsCollapse" class="collapse d-md-block pb-4 border-bottom mt-4 mt-md-0">
            <div class="row row-gap-4 justify-content-between text-center">
                <div class="col-lg-3 col-md-6 mb-md-0">
                    <IngredientCardAmount :amount="0" image="/logo.webp" description="Összes" class="mx-auto"
                        loading="lazy" />
                </div>
                <div class="col-lg-3 col-md-6 mb-md-0">
                    <IngredientCardAmount :amount="0" image="/logo.webp" description="Friss" class="mx-auto"
                        loading="lazy" />
                </div>
                <div class="col-lg-3 col-md-6 mb-md-0">
                    <IngredientCardAmount :amount="0" image="/logo.webp" description="Hamarosan Lejár" class="mx-auto"
                        loading="lazy" />
                </div>
                <div class="col-lg-3 col-md-6">
                    <IngredientCardAmount :amount="0" image="/logo.webp" description="Lejárt" class="mx-auto"
                        loading="lazy" />
                </div>
            </div>
        </div>
        <div class="row mt-4">
            <h2>Meglévő alapanyagaim</h2>
            <SearchBar v-model="params.query" placeholder="Keresés" />
            <div>
                <h3 class="fs-3 mt-3">Találatok az alábbi keresésre:</h3>
                <div class="g-3 row mb-5 mt-4">
                    <div class="pe-1 d-flex col-xl-4 col-lg-6 col-sm-12 flex-row justify-content-center"
                        v-for="ingredient in results">
                        <IngredientCard class="h-100" :amount="ingredient.amount" :name="ingredient.name"
                            :expiry="ingredient.expiry.toString()" :unit="ingredient.unit" :tag="ingredient.tag"
                            :image="'images/background.webp'" />
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div v-if="showIngredientModal" class="ingredient-modal-backdrop" @click.self="closeIngredientModal">
        <div class="ingredient-modal-panel">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3 class="mb-0">Új hozzávaló felvétele</h3>
                <Button type="button" icon-only icon="bi bi-x-circle" class="p-0" @click="closeIngredientModal" />
            </div>

            <div class="mb-3">
                <label class="form-label">Hozzávaló megnevezése</label>
                <input v-model="newIngredient.name" type="text" class="form-control" placeholder="Pl. Tej" />
            </div>

            <div class="row g-2 mb-3">
                <div class="col-7">
                    <label class="form-label">Mennyiség</label>
                    <input v-model.number="newIngredient.amount" type="number" class="form-control" placeholder="100" />
                </div>
                <div class="col-5">
                    <label class="form-label">Egység</label>
                    <input v-model="newIngredient.unit" type="text" class="form-control" placeholder="g, ml..." />
                </div>
            </div>

            <div class="mb-4">
                <label class="form-label">Lejárati idő</label>
                <input v-model="newIngredient.expiresAt" type="date" class="form-control" />
            </div>

            <div class="d-flex justify-content-end">
                <Button color="dark" type="button" @click="saveIngredient">
                    MENTÉS
                </Button>
            </div>
        </div>
    </div>

    <Alert message="Helytelen adat." :show="showAlert" type="error" @close="showAlert = false" />
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