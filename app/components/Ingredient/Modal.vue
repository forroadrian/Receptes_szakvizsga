<script setup lang="ts">
import ExpiryDate from '~/models/ExpiryDate';
import Ingredient from '~/models/Ingredient';
import { useIngredientStore } from '~/stores/ingredients';

const ingredientState = useIngredientStore();
const { formatUnit } = useUnitFormatter();
const { t } = useI18n();
const { showAlert } = useAlert();

const {
    units,
    closeIngredientModal,
    pushIngredient,
    postIngredient,
    loadAvailableIngredients,
    availableIngredients
} = ingredientState

const reportValidationError = () => showAlert('error', t('pantry.modal.errors.validation'));
const reportSaveError = () => showAlert('error', t('pantry.modal.errors.saveFailed'));
const reportLoadError = () => showAlert('error', t('pantry.modal.errors.loadFailed'));

const inputName = ref("")
const inputIngredientId = ref<number | null>(null)
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

const nameIsValid = computed(() => inputIngredientId.value !== null)

function selectIngredient(item: { id: number, name: string }) {
    inputIngredientId.value = item.id
    inputName.value = item.name
    nameInputOpen.value = false
}

function onNameBlur() {
    nameInputOpen.value = false
    if (!nameIsValid.value) {
        inputName.value = ""
        inputIngredientId.value = null
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
    inputIngredientId.value = null
    inputQuantity.value = null
    inputUnit.value = ""
    inputExpiry.value = ""
}

async function saveIngredient() {
    if (!nameIsValid.value || inputUnit.value == "" || inputExpiry.value == "" || inputQuantity.value == null || inputQuantity.value <= 0) {
        reportValidationError()
        return
    }
    try {
        const expiry = new ExpiryDate(new Date(inputExpiry.value))

        const newIngredient: Ingredient = new Ingredient(
            inputIngredientId.value!,
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
    } catch (error: any) {
        reportSaveError()
    }
}

onMounted(async () => {
    try {
        await loadAvailableIngredients()
    } catch {
        reportLoadError()
    }
})
</script>
<template>
    <div class="modal-backdrop" @click.self="closeIngredientModal">
        <div class="modal-panel">

            <div class="modal-inner">

                <div class="d-flex justify-content-between align-items-center mb-4">
                    <div class="d-flex align-items-center gap-2">
                        <div class="modal-icon">
                            <i class="bi bi-basket2"></i>
                        </div>
                        <div>
                            <p class="modal-label mb-0">{{ $t('pantry.modal.label') }}</p>
                            <h3 class="mb-0">{{ $t('pantry.modal.title') }}</h3>
                        </div>
                    </div>
                    <button class="close-btn" @click="closeIngredientModal">
                        <i class="bi bi-x"></i>
                    </button>
                </div>

                <div class="position-relative mb-3">
                    <label class="field-label">{{ $t('pantry.modal.fieldCombined') }}</label>
                    <div class="combined-input">

                        <div class="name-section">
                            <div v-if="!nameInputOpen" class="section-trigger" @click="openNameInput">
                                <span :class="inputName ? '' : 'placeholder-text'">{{ inputName || $t('pantry.modal.namePlaceholder') }}</span>
                                <i class="bi bi-chevron-down ms-auto"></i>
                            </div>
                            <input v-else id="ingredient-name-input" v-model="inputName" type="text"
                                class="name-text-input" :placeholder="$t('pantry.modal.namePlaceholder')" autocomplete="off" @blur="onNameBlur" />
                        </div>

                        <div class="section-divider"></div>

                        <input v-model.number="inputQuantity" type="number" class="quantity-section" placeholder="100"
                            min="0" />

                        <div class="section-divider"></div>

                        <div class="unit-section">
                            <div class="section-trigger" @click="unitDropdownOpen = true">
                                <span :class="inputUnit ? '' : 'placeholder-text'">{{ inputUnit ? formatUnit(inputUnit) : $t('pantry.modal.unitPlaceholder') }}</span>
                                <i class="bi bi-chevron-down ms-auto"></i>
                            </div>
                        </div>
                    </div>

                    <ul v-if="nameInputOpen" class="name-dropdown list-group position-absolute w-100">
                        <li v-for="item in filteredIngredients" :key="item.id"
                            class="list-group-item list-group-item-action" @mousedown.prevent="selectIngredient(item)">
                            {{ item.name }}
                        </li>
                    </ul>
                </div>

                <template v-if="!unitDropdownOpen">
                    <div class="mb-4">
                        <label class="field-label">{{ $t('pantry.modal.expiryDate') }}</label>
                        <input v-model="inputExpiry" type="date" class="date-input form-control" />
                    </div>

                    <Button color="orange" icon="bi bi-check2" iconPosition="left" type="button" @click="saveIngredient"
                        class="w-100">
                        {{ $t('common.actions.save') }}
                    </Button>
                </template>

                <div v-else class="unit-drawer">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <span class="field-label mb-0">{{ $t('pantry.modal.unitPicker') }}</span>
                        <button class="unit-drawer-close" @click="unitDropdownOpen = false">
                            <i class="bi bi-x"></i>
                        </button>
                    </div>
                    <div class="unit-pill-grid">
                        <button v-for="unit in units" :key="unit" class="unit-pill"
                            :class="{ active: inputUnit === unit }" @click="selectUnit(unit)">
                            {{ formatUnit(unit) }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>
<style scoped>
.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(3px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1050;
    animation: backdrop-in 0.2s ease both;
}

@keyframes backdrop-in {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.modal-panel {
    background: var(--bs-body-bg);
    border-radius: 20px;
    width: 100%;
    max-width: 440px;
    overflow: visible;
    box-shadow:
        0 20px 60px rgba(0, 0, 0, 0.25),
        0 0 40px rgba(255, 114, 49, 0.12);
    border: 1px solid var(--accent-border);
    animation: panel-in 0.2s ease both;
}

@keyframes panel-in {
    from {
        opacity: 0;
        transform: scale(0.95);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

.modal-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: var(--grad-yellow);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: var(--text-dark);
    box-shadow: 0 4px 12px rgba(255, 114, 49, 0.3);
}

.modal-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--orange);
}

.close-btn {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: 1px solid var(--bs-border-color);
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    cursor: pointer;
    color: var(--bs-secondary-color);
    transition: background 0.15s, color 0.15s;
}

.close-btn:hover {
    background: var(--bs-secondary-bg);
    color: var(--bs-emphasis-color);
}

.modal-inner {
    padding: 24px 28px 28px;
    position: relative;
}

@media (min-width: 992px) {
    .modal-backdrop {
        justify-content: flex-end;
        align-items: flex-start;
        padding: 32px 40px;
    }
}

.field-label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--bs-secondary-color);
    margin-bottom: 6px;
}

.combined-input {
    display: flex;
    align-items: stretch;
    border: 1.5px solid var(--bs-border-color);
    border-radius: var(--radius-sm);
    background: var(--bs-body-bg);
    transition: border-color 0.15s, box-shadow 0.15s;
}

.combined-input:focus-within {
    border-color: var(--accent-border);
    box-shadow: 0 0 0 3px var(--accent-shadow);
}

.name-section {
    flex: 1;
    padding: 10px 14px;
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
    font-size: 15px;
}

.section-divider {
    width: 1px;
    background: var(--bs-border-color);
    margin: 8px 0;
}

.quantity-section {
    width: 80px;
    border: none;
    outline: none;
    background: transparent;
    color: var(--bs-body-color);
    padding: 10px 14px;
    text-align: right;
    font-size: 15px;
    -moz-appearance: textfield;
}

.quantity-section::-webkit-outer-spin-button,
.quantity-section::-webkit-inner-spin-button {
    -webkit-appearance: none;
}

.unit-section {
    width: 95px;
    padding: 10px 14px;
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
    font-size: 15px;
}

.placeholder-text {
    color: var(--bs-secondary-color);
}

.name-dropdown {
    top: 100%;
    left: 0;
    z-index: 1060;
    max-height: 200px;
    overflow-y: auto;
    border-radius: var(--radius-sm);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15), 0 0 0 1px var(--accent-border);
    margin-top: 6px;
}

.unit-drawer {
    border-top: 1.5px solid #E8E0D4;
    padding-top: 18px;
}

.unit-pill-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.unit-pill {
    font-size: 13px;
    font-weight: 500;
    padding: 6px 14px;
    border-radius: 20px;
    background: #F0EBE2;
    color: #6B5A48;
    cursor: pointer;
    border: 1.5px solid transparent;
    transition: background 0.13s, color 0.13s, border-color 0.13s;
}

.unit-pill:hover {
    background: rgba(201, 79, 30, 0.12);
    color: #C94F1E;
    border-color: #C94F1E;
}

.unit-pill.active {
    background: #C94F1E;
    color: white;
    border-color: #C94F1E;
}

.unit-drawer-close {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 1px solid var(--bs-border-color);
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    cursor: pointer;
    color: var(--bs-secondary-color);
}

.list-group-item-action:hover {
    background: var(--accent-soft);
    color: var(--bs-emphasis-color);
}

.date-input {
    border-radius: var(--radius-sm);
    border: 1.5px solid var(--bs-border-color);
    padding: 10px 14px;
    font-size: 15px;
    transition: border-color 0.15s, box-shadow 0.15s;
}

.date-input:focus {
    border-color: var(--accent-border);
    box-shadow: 0 0 0 3px var(--accent-shadow);
}
</style>
