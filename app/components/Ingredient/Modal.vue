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

const inputName = ref("")
const inputQuantity = ref<number | null>(null)
const inputUnit = ref("")
const inputExpiry = ref("")

const nameInputOpen = ref(false)
const unitDropdownOpen = ref(false)

const filteredIngredients = computed(() => {
    if (inputName.value == "") {
        return ingredientState.availableIngredients.slice(0, 10)
    }
    const results = []
    for (const item of ingredientState.availableIngredients) {
        if (item.name.toLowerCase().includes(inputName.value.toLowerCase())) {
            results.push(item)
        }
        if (results.length >= 10) break
    }
    return results
})

const nameIsValid = computed(() => {
    let found = false
    for (const item of ingredientState.availableIngredients) {
        if (item.name === inputName.value) {
            found = true
        }
    }
    return found
})

function selectIngredient(name: string) {
    inputName.value = name
    nameInputOpen.value = false
}

function onNameBlur() {
    nameInputOpen.value = false
    if (!nameIsValid.value) {
        inputName.value = ""
    }
}

async function openNameInput() {
    nameInputOpen.value = true
    await nextTick()
    document.getElementById("ingredient-name-input")?.focus()
}

function selectUnit(unit: string) {
    inputUnit.value = unit
    unitDropdownOpen.value = false
}

function resetForm() {
    inputName.value = ""
    inputQuantity.value = null
    inputUnit.value = ""
    inputExpiry.value = ""
}

async function saveIngredient() {
    if (!nameIsValid.value || inputUnit.value == "" || inputExpiry.value == "" || inputQuantity.value == null || inputQuantity.value <= 0) {
        showAlert()
        return
    }
    try {
        const expiry = new ExpiryDate(new Date(inputExpiry.value))

        const newIngredient: Ingredient = new Ingredient(
            -1,
            inputName.value,
            inputQuantity.value,
            inputUnit.value,
            expiry
        )
        const res: any = await postIngredient(newIngredient)
        newIngredient.id = res.ingredient_id
        newIngredient.tag = expiry.checkExpiry()

        pushIngredient(newIngredient)
        resetForm()
        closeIngredientModal()
    } catch(error: any) {
        showAlert()
    }
}

onMounted(() => {
    loadAvailableIngredients()
})
</script>
<template>
    <div class="modal-backdrop" @click.self="closeIngredientModal">
        <div class="modal-panel">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3 class="mb-0">Új hozzávaló felvétele</h3>
                <i class="bi bi-x p-0" @click="closeIngredientModal"></i>
            </div>

            <div class="position-relative mb-3">
                <label class="form-label">Hozzávaló</label>
                <div class="combined-input">

                    <div class="name-section">
                        <div v-if="!nameInputOpen" class="section-trigger" @click="openNameInput">
                            <span :class="inputName ? '' : 'text-muted'">{{ inputName || 'Pl. Tej' }}</span>
                            <i class="bi bi-chevron-down ms-auto"></i>
                        </div>
                        <input
                            v-else
                            id="ingredient-name-input"
                            v-model="inputName"
                            type="text"
                            class="name-text-input"
                            placeholder="Pl. Tej"
                            autocomplete="off"
                            @blur="onNameBlur"
                        />
                    </div>

                    <div class="section-divider"></div>

                    <input
                        v-model.number="inputQuantity"
                        type="number"
                        class="quantity-section"
                        placeholder="100"
                        min="0"
                    />

                    <div class="section-divider"></div>

                    <div class="unit-section">
                        <div v-if="!unitDropdownOpen" class="section-trigger" @click="unitDropdownOpen = true">
                            <span :class="inputUnit ? '' : 'text-muted'">{{ inputUnit || 'Egység' }}</span>
                            <i class="bi bi-chevron-down ms-auto"></i>
                        </div>
                        <ul v-else class="unit-dropdown list-group position-absolute">
                            <li
                                v-for="unit in units"
                                :key="unit"
                                class="list-group-item list-group-item-action"
                                @mousedown.prevent="selectUnit(unit)"
                            >
                                {{ unit }}
                            </li>
                        </ul>
                    </div>
                </div>

                <ul v-if="nameInputOpen" class="name-dropdown list-group position-absolute w-100">
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

            <div class="mb-4">
                <label class="form-label">Lejárati idő</label>
                <input v-model="inputExpiry" type="date" class="form-control" />
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
<style scoped>
.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.35);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1050;
}

.modal-panel {
    background: var(--bs-body-bg);
    border-radius: 24px;
    padding: 24px 28px;
    width: 100%;
    max-width: 420px;
    box-shadow: 0 18px 45px rgba(0, 0, 0, 0.25);
}

@media (min-width: 992px) {
    .modal-backdrop {
        justify-content: flex-end;
        align-items: flex-start;
        padding: 32px 40px;
    }
}

i:hover {
    cursor: pointer;
}

.combined-input {
    display: flex;
    align-items: stretch;
    border: 1px solid var(--bs-border-color);
    border-radius: 8px;
    background: var(--bs-body-bg);
}

.combined-input:focus-within {
    border-color: #86b7fe;
    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.name-section {
    flex: 1;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    min-width: 0;
}

.name-text-input {
    border: none;
    outline: none;
    background: transparent;
    width: 100%;
    color: var(--bs-body-color);
}

.section-divider {
    width: 1px;
    background: var(--bs-border-color);
    margin: 6px 0;
}

.quantity-section {
    width: 80px;
    border: none;
    outline: none;
    background: transparent;
    color: var(--bs-body-color);
    padding: 8px 12px;
    text-align: right;
    -moz-appearance: textfield;
}


.unit-section {
    width: 90px;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    position: relative;
}

.section-trigger {
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
    width: 100%;
}

.name-dropdown {
    top: 100%;
    left: 0;
    z-index: 1060;
    max-height: 200px;
    overflow-y: auto;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    margin-top: 4px;
}

.unit-dropdown {
    top: 100%;
    right: 0;
    z-index: 1060;
    max-height: 200px;
    overflow-y: auto;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    min-width: 100px;
    margin-top: 4px;
}
</style>
