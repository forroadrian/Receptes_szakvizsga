<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import ExpiryDate from "~/models/ExpiryDate";
import IngredientModel from "~/models/Ingredient";
import type Ingredient from "~/models/Ingredient";
import type SearchParams from "~/interfaces/SearchParams";
import { useIngredientStore } from "~/stores/ingredients";

const store = useIngredientStore();
const { formatIngredient } = useIngredientFormatter();

const modalElRef = ref<HTMLElement | null>(null);
let modalInstance: any = null;

const mode = ref<"create" | "edit">("create");
const originalId = ref<number | null>(null);

const name = ref("");
const ingredientId = ref<number | null>(null);
const quantity = ref<number | null>(null);
const unit = ref("");
const expiry = ref("");

const dropdownOpen = ref(false);
const saving = ref(false);
const deleting = ref(false);
const errorMessage = ref("");

const missing = ref<{ name: string; appears: number }[]>([]);

const isEdit = computed(() => mode.value === "edit");

type LocalizedAvailable = { id: number; name: string; localizedName: string };

const localizedAvailable = computed<LocalizedAvailable[]>(() =>
    store.availableIngredients.map((i) => ({
        id: i.id,
        name: i.name,
        localizedName: formatIngredient(i.id),
    }))
);

const searchParams = computed<SearchParams<LocalizedAvailable>>(() => ({
    haystack: localizedAvailable.value,
    searchFor: ["localizedName"],
    query: name.value.trim(),
    showAllByDefault: true,
}));

const searchResults = useSearch(searchParams);
const filteredNames = computed(() => searchResults.value.slice(0, 10));

const canSubmit = computed(
    () =>
        ingredientId.value !== null &&
        unit.value !== "" &&
        expiry.value !== "" &&
        quantity.value !== null &&
        quantity.value > 0
);

const selectIngredient = (item: { id: number; name: string }) => {
    ingredientId.value = item.id;
    name.value = formatIngredient(item.id);
    dropdownOpen.value = false;
};

const selectByName = (ingredientName: string) => {
    console.log(ingredientName);
    
    const found = store.availableIngredients.find((i) => {
        
        return i.name === ingredientName
    });
    if (found) selectIngredient(found);
};

const selectById = (ingredientId: number) => {
    const found = store.availableIngredients.find((i) => {
        
        return i.id === ingredientId
    });
    if (found) selectIngredient(found);
}

const onNameBlur = () => {
    dropdownOpen.value = false;
    if (ingredientId.value === null) {
        name.value = "";
    }
};

const openDropdown = async () => {
    dropdownOpen.value = true;
};

const reset = () => {
    mode.value = "create";
    originalId.value = null;
    name.value = "";
    ingredientId.value = null;
    quantity.value = null;
    unit.value = "";
    expiry.value = "";
    saving.value = false;
    deleting.value = false;
    errorMessage.value = "";
};

const ensureModalInstance = () => {
    if (modalInstance) return modalInstance;
    if (!modalElRef.value) return null;
    const bs = (window as any).bootstrap;
    if (!bs?.Modal) return null;
    modalInstance = bs.Modal.getOrCreateInstance(modalElRef.value);
    return modalInstance;
};

const loadMissing = async () => {
    try {
        const res = await store.getMissing();
        missing.value = Array.isArray(res) ? res : [];
    } catch {
        missing.value = [];
    }
};

const open = async (prefillName?: string) => {
    reset();
    if (!store.availableIngredients.length) {
        await store.loadAvailableIngredients();
    }
    loadMissing();
    if (prefillName) selectByName(prefillName);
    ensureModalInstance()?.show();
};

const openForEdit = async (ingredient: Ingredient) => {
    reset();
    if (!store.availableIngredients.length) {
        await store.loadAvailableIngredients();
    }
    mode.value = "edit";
    originalId.value = ingredient.id;
    ingredientId.value = ingredient.id;
    name.value = ingredient.name;
    quantity.value = ingredient.quantity;
    unit.value = ingredient.unit;
    expiry.value = ingredient.expiry.toShort();
    ensureModalInstance()?.show();
};

const close = () => modalInstance?.hide();

const handleSave = async () => {
    if (!canSubmit.value || saving.value) return;
    saving.value = true;
    errorMessage.value = "";
    try {
        const exp = new ExpiryDate(new Date(expiry.value));
        const item = new IngredientModel(
            ingredientId.value!,
            name.value,
            quantity.value!,
            unit.value,
            exp
        );
        if (isEdit.value && originalId.value !== null) {
            item.tag = exp.checkExpiry();
            await store.updateIngredient(originalId.value, item);
        } else {
            const res: any = await store.postIngredient(item);
            item.id = res.ingredient_id;
            item.tag = exp.checkExpiry();
            store.pushIngredient(item);
        }
        close();
        reset();
    } catch (err: any) {
        errorMessage.value =
            err?.data?.message ?? err?.message ?? $t('pantry.addModal.fields.errors.saveFailed');
    } finally {
        saving.value = false;
    }
};

const handleDelete = async () => {
    if (!isEdit.value || originalId.value === null || deleting.value) return;
    if (!confirm($t('pantry.addModal.fields.deleteConfirm'))) return;
    deleting.value = true;
    errorMessage.value = "";
    try {
        await store.removeIngredient(originalId.value);
        close();
        reset();
    } catch (err: any) {
        errorMessage.value =
            err?.data?.message ?? err?.message ?? $t('pantry.addModal.fields.errors.deleteFailed');
    } finally {
        deleting.value = false;
    }
};

onMounted(() => {
    ensureModalInstance();
});

defineExpose({ open, openForEdit });
</script>

<template>
    <div
        id="ingredientAddModal"
        ref="modalElRef"
        class="modal fade"
        tabindex="-1"
        aria-labelledby="ingredientAddModalLabel"
        aria-hidden="true"
    >
        <div class="modal-dialog modal-dialog-centered modal-lg ingredient-add-dialog">
            <div class="modal-content ingredient-add-modal">
                <div class="modal-header">
                    <div class="d-flex flex-column">
                        <h2 id="ingredientAddModalLabel" class="modal-title fs-4 mb-1">
                            {{ isEdit ? $t('pantry.addModal.title.edit') : $t('pantry.addModal.title.create') }}
                        </h2>
                        <p class="mb-0 text-muted small">
                            {{ isEdit ? $t('pantry.addModal.subtitle.edit') : $t('pantry.addModal.subtitle.create') }}
                        </p>
                    </div>
                    <button
                        type="button"
                        class="btn-close ms-3"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                    ></button>
                </div>

                <div class="modal-body">
                    <form @submit.prevent="handleSave" class="form">
                        <div class="field">
                            <label class="form-label small fw-semibold" for="addName">
                                {{ $t('pantry.addModal.fields.name') }}
                            </label>
                            <div class="position-relative">
                                <div
                                    v-if="!dropdownOpen"
                                    class="form-control form-control-pickerlike"
                                    :class="{ placeholder: !name }"
                                    @click="openDropdown"
                                >
                                    {{ name || $t('pantry.addModal.fields.namePlaceholder') }}
                                    <i class="bi bi-chevron-down ms-auto"></i>
                                </div>
                                <input
                                    v-else
                                    id="addName"
                                    v-model="name"
                                    type="text"
                                    class="form-control"
                                    :placeholder="$t('pantry.addModal.fields.namePlaceholder')"
                                    autocomplete="off"
                                    @blur="onNameBlur"
                                />
                                <ul
                                    v-if="dropdownOpen && filteredNames.length"
                                    class="add-dropdown"
                                >
                                    <li
                                        v-for="item in filteredNames"
                                        :key="item.id"
                                        @mousedown.prevent="selectIngredient(item)"
                                    >
                                        {{ formatIngredient(item.id) }}
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div class="row g-3 field-row">
                            <div class="col-12 col-md-6">
                                <label class="form-label small fw-semibold" for="addExpiry">
                                    {{ $t('pantry.addModal.fields.expiry') }}
                                </label>
                                <input
                                    id="addExpiry"
                                    v-model="expiry"
                                    type="date"
                                    class="form-control"
                                />
                            </div>
                            <div class="col-12 col-md-6">
                                <label class="form-label small fw-semibold">
                                    {{ $t('pantry.addModal.fields.quantityUnit') }}
                                </label>
                                <div class="input-group">
                                    <input
                                        v-model.number="quantity"
                                        type="number"
                                        class="form-control"
                                        placeholder="10"
                                        min="0"
                                        step="any"
                                    />
                                    <select v-model="unit" class="form-select unit-select">
                                        <option value="" disabled>{{ $t('pantry.addModal.fields.unitPlaceholder') }}</option>
                                        <option v-for="u in store.units" :key="u" :value="u">
                                            {{ u }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <section v-if="!isEdit && missing.length" class="suggestions-section">
                            <header class="suggestions-head">
                                <p class="suggestions-title mb-0">
                                    <i class="bi bi-stars me-2"></i>
                                    {{ $t('pantry.addModal.suggestions.title') }}
                                </p>
                                <span class="suggestions-hint">{{ $t('pantry.addModal.suggestions.hint') }}</span>
                            </header>
                            <div class="suggestion-pills">
                                <button
                                    v-for="item in missing.slice(0, 8)"
                                    :key="item.name"
                                    type="button"
                                    class="suggestion-pill"
                                    :class="{ active: name === item.name }"
                                    @click="selectById(item.ingredient_id)"
                                > <!--Stale data, don't mind it, it runs correctly :)-->
                                    <i class="bi bi-plus-circle me-1"></i>
                                    {{ formatIngredient(item.ingredient_id) }}
                                </button>
                            </div>
                        </section>
                    </form>
                </div>

                <div class="modal-footer flex-column align-items-stretch gap-2">
                    <p v-if="errorMessage" class="text-danger small mb-0">
                        {{ errorMessage }}
                    </p>
                    <div class="d-flex justify-content-between align-items-center gap-2 flex-wrap">
                        <button
                            v-if="isEdit"
                            type="button"
                            class="btn btn-delete"
                            :disabled="deleting || saving"
                            @click="handleDelete"
                        >
                            <i class="bi bi-trash3 me-1"></i>
                            {{ deleting ? $t('common.actions.deleting') : $t('common.actions.delete') }}
                        </button>
                        <div v-else></div>

                        <div class="d-flex gap-2 flex-wrap">
                            <button
                                type="button"
                                class="btn btn-outline-secondary"
                                data-bs-dismiss="modal"
                            >
                                {{ $t('common.actions.cancel') }}
                            </button>
                            <Button
                                color="orange"
                                :disabled="!canSubmit || saving || deleting"
                                @click="handleSave"
                            >
                                {{ saving ? $t('common.actions.saving') : $t('common.actions.save') }}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.modal-content {
    background: var(--bs-body-bg);
    color: var(--bs-body-color);
    border-radius: var(--radius-md);
}

.form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-control-pickerlike {
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
}

.form-control-pickerlike.placeholder {
    color: var(--bs-secondary-color);
}

.form-control-pickerlike i {
    color: var(--bs-secondary-color);
    font-size: 14px;
}

.add-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 5;
    max-height: 240px;
    overflow-y: auto;
    margin: 4px 0 0;
    padding: 4px 0;
    list-style: none;
    background: var(--bs-body-bg);
    border: 1px solid var(--bs-border-color);
    border-radius: var(--radius-sm);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.add-dropdown li {
    padding: 0.45rem 0.85rem;
    cursor: pointer;
    color: var(--bs-body-color);
    font-size: var(--small-text);
}

.add-dropdown li:hover {
    background: var(--accent-soft);
    color: var(--bs-emphasis-color);
}

[data-bs-theme="dark"] .add-dropdown li:hover {
    background: rgba(255, 114, 49, 0.1);
}

.unit-select {
    max-width: 110px;
}

.btn-delete {
    display: inline-flex;
    align-items: center;
    padding: 0.4rem 0.9rem;
    border: 1px solid #d64545;
    color: #d64545;
    background: transparent;
    border-radius: var(--radius-sm);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease-in;
}

.btn-delete:hover:not(:disabled) {
    background: #d64545;
    color: var(--text-light);
}

.btn-delete:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.suggestions-section {
    margin-top: 0.5rem;
    padding-top: 1rem;
    border-top: 1px dashed var(--bs-border-color);
}

.suggestions-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    flex-wrap: wrap;
}

.suggestions-title {
    font-weight: 700;
    color: var(--bs-emphasis-color);
    display: inline-flex;
    align-items: center;
}

.suggestions-title i {
    color: var(--orange);
}

.suggestions-hint {
    font-size: 11px;
    color: var(--bs-secondary-color);
}

.suggestion-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
}

.suggestion-pill {
    padding: 0.3rem 0.7rem;
    font-size: var(--small-text);
    font-weight: 500;
    color: var(--bs-body-color);
    background: var(--bs-tertiary-bg);
    border: 1px solid var(--bs-border-color);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.15s ease-in;
}

.suggestion-pill:hover {
    background: var(--accent-soft);
    border-color: var(--orange);
    color: var(--orange);
}

.suggestion-pill.active {
    background: var(--grad-orange);
    color: var(--text-light);
    border-color: transparent;
}

[data-bs-theme="dark"] .suggestion-pill:hover {
    background: rgba(255, 114, 49, 0.1);
}

@media (max-width: 576px) {
    .field-row .col-md-6 + .col-md-6 {
        margin-top: 0.5rem;
    }
}
</style>
