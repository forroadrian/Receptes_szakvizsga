<script setup lang="ts">
definePageMeta({
    middleware: "auth-only",
});
import type SearchParams from "~/interfaces/SearchParams";
import Ingredient from "~/models/Ingredient";

const showAlert = ref<boolean>();

const colorMode = useColorMode();

const loadingData = ref<boolean>(false)

const buttonColor = computed(() => {
    if (colorMode.value === "dark") return "soft";
    return "dark";
});

const ingredients = ref<Ingredient[]>([])

const params = ref<SearchParams<Ingredient>>({
    haystack: ingredients.value as Ingredient[],
    searchFor: ["name"],
    showAllByDefault: true,
});

const results = useSearch(params);

const showIngredientModal = ref(false);

const newIngredient = ref({
    name: "",
    quantity: null as number | null,
    unit: "",
    expiry: "",
});

function openIngredientModal() {
    showIngredientModal.value = true;
}

function closeIngredientModal() {
    showIngredientModal.value = false;
}

const saveIngredient = async () => {
    if (
        newIngredient.value.name.length === 0 ||
        newIngredient.value.unit === "" ||
        newIngredient.value.expiry.length === 0 ||
        newIngredient.value.quantity == null ||
        newIngredient.value.quantity <= 0
    ) {
        showAlert.value = true;
        return;
    }

    await $fetch('api/ingredient', {
        method: "POST",
        body: {
            name: newIngredient.value.name,
            unit: newIngredient.value.unit,
            quantity: newIngredient.value.quantity,
            expiry: newIngredient.value.expiry
        }
    })

    ingredients.value.push(
        new Ingredient(
            -1,
            newIngredient.value.name,
            newIngredient.value.quantity,
            newIngredient.value.unit,
            newIngredient.value.expiry
        )
    );

    newIngredient.value = {
        name: "",
        quantity: null,
        unit: "",
        expiry: "",
    };

    closeIngredientModal();
};

const onDelete = (ingredient: Ingredient) => {
    ingredients.value.splice(ingredients.value.indexOf(ingredient), 1);
};

const onEdit = (ingredient: Ingredient) => { };

onMounted(async () => {
    const res: any = await $fetch("/api/ingredient", {method: "GET"})
    console.log(res);
    loadingData.value = true;
    for (const ingredientData of res) {
        let ingredient = new Ingredient(ingredientData.ingredient.id,ingredientData.ingredient.name,ingredientData.quantity,ingredientData.unit, ingredientData.expiry_date)
        ingredients.value.push(ingredient)      
    }
    loadingData.value = false;
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

            <Button class="col-lg-4 col-10 mx-auto" icon="bi bi-plus" type="button" :color="buttonColor"
                @click="openIngredientModal">Új hozzávaló hozzáadása</Button>
            <Button class="d-md-none col-1 border-2" outline color="dark" icon="bi bi-graph-up" iconPosition="left"
                icon-only type="button" data-bs-toggle="collapse" data-bs-target="#statsCollapse">
            </Button>
        </div>
        <div id="statsCollapse" class="collapse d-md-block pb-4 border-bottom mt-4 mt-md-0 py-3">
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
            <h2 class="py-3">Meglévő alapanyagaim</h2>
            <SearchBar v-model="params.query" placeholder="Keresés" class="px-3 mx-3" />
            <div>
                <h5 class="mt-3 py-3">Találatok az alábbi keresésre:</h5>
                <div class="g-3 row mb-5 mt-4">
                    <div class="pe-1 d-flex col-xl-4 col-lg-6 col-sm-12 flex-row justify-content-center"
                        v-if="results.length > 0" v-for="ingredient in results">
                        <IngredientCard :ingredient="ingredient" @delete="onDelete" :image="'images/background.webp'" />
                    </div>
                    <div v-else>
                        <p class="fs-2 text-center fw-bold" v-if="!loadingData">
                            Sajnos nem találtunk ilyen alapanyagot :(
                        </p>
                        <p class="fs-2 text-center fw-bold" v-else>
                            Adatok betöltése folyamatban.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div v-if="showIngredientModal" class="ingredient-modal-backdrop" @click.self="closeIngredientModal">
        <div class="ingredient-modal-panel">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3 class="mb-0">Új hozzávaló felvétele</h3>
                <i class="bi bi-x p-0" @click="closeIngredientModal"> </i>
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
                    <input v-model="newIngredient.unit" type="text" class="form-control" placeholder="g, ml..." />
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
