<script setup lang="ts">
import ExpiryDate from '~/models/ExpiryDate';
import Ingredient from '~/models/Ingredient';
import { useIngredientStore } from '~/stores/ingredients';

const ingredientState = useIngredientStore();

const {
    units,
    closeIngredientModal,
    pushIngredient,
    postIngredient,
    loadAvailableIngredients,
    availableIngredients
} = ingredientState

const isAlert = ref<boolean>(false);
function showAlert(){
    isAlert.value = true;
}

const input = ref({
    name: "",
    quantity: null as number | null,
    unit: "",
    expiry: "",
});

const showDropdown = ref(false);

const filteredIngredients = computed(() => {
    const q = input.value.name.toLowerCase().trim();
    if (!q) return availableIngredients.slice(0, 10);
    return availableIngredients
        .filter(i => i.name.toLowerCase().includes(q))
        .slice(0, 10);
});

const nameIsValid = computed(() =>
    availableIngredients.some(i => i.name === input.value.name)
);

const selectIngredient = (name: string) => {
    input.value.name = name;
    showDropdown.value = false;
};

const onBlur = () => {
    showDropdown.value = false;
    if (!nameIsValid.value) input.value.name = "";
};

const checkInput = () =>
        !nameIsValid.value ||
        input.value.unit === "" ||
        input.value.expiry.length === 0 ||
        input.value.quantity == null ||
        input.value.quantity <= 0

const resetInputData = () => {
    input.value = {
        name: "",
        quantity: null,
        unit: "",
        expiry: "",
    };
}

const saveIngredient = async () => {
    if (checkInput()) {
        throw createError({
            status: 404,
            statusText: "Ingredient data is incomplete"
        });
    }
    try {
        const expiry = new ExpiryDate(new Date(input.value.expiry));

        const newIngredient: Ingredient = new Ingredient(-1,
            input.value.name,
            input.value.quantity as number,
            input.value.unit,
            expiry
        );
        const res: any = postIngredient(newIngredient);
        newIngredient.id = res.ingredient_id;
        newIngredient.tag = expiry.checkExpiry();

        pushIngredient(newIngredient);
        resetInputData();
        closeIngredientModal();

    } catch(error: any) {
        showAlert();
    }
};

onMounted(() => {
    loadAvailableIngredients();
});
</script>
<template>
    <div class="ingredient-modal-backdrop" @click.self="closeIngredientModal">
        <div class="ingredient-modal-panel">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3 class="mb-0">Új hozzávaló felvétele</h3>
                <i class="bi bi-x p-0" @click="closeIngredientModal"></i>
            </div>

            <div class="mb-3 position-relative">
                <label class="form-label">Hozzávaló megnevezése</label>
                <input
                    v-model="input.name"
                    type="text"
                    class="form-control"
                    placeholder="Pl. Tej"
                    autocomplete="off"
                    @focus="showDropdown = true"
                    @blur="onBlur"
                />
                <ul
                    v-if="showDropdown"
                    class="ingredient-dropdown list-group position-absolute w-100"
                >
                    <li
                        v-for="item in filteredIngredients"
                        :key="item.id"
                        class="list-group-item list-group-item-action"
                        @mousedown.prevent="selectIngredient(item.name)"
                    >
                        {{ item.name }}
                    </li>
                </ul>
            </div>

            <div class="row g-2 mb-3">
                <div class="col-7">
                    <label class="form-label">Mennyiség</label>
                    <input v-model.number="input.quantity" type="number" class="form-control"
                        placeholder="100" />
                </div>
                <div class="col-5">
                    <label class="form-label">Egység</label>
                    <select class="form-select" v-model="input.unit">
                        <option v-for="unit in units" :value="unit">{{ unit }}</option>
                    </select>
                </div>
            </div>

            <div class="mb-4">
                <label class="form-label">Lejárati idő</label>
                <input v-model="input.expiry" type="date" class="form-control" />
            </div>

            <div class="d-flex justify-content-end">
                <Button color="dark" type="button" @click="saveIngredient">
                    MENTÉS
                </Button>
            </div>
        </div>
    </div>
</template>
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

i:hover {
    cursor: pointer;
}

.ingredient-dropdown {
    top: 100%;
    left: 0;
    z-index: 1060;
    max-height: 200px;
    overflow-y: auto;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
