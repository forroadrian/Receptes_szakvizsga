<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import ExpiryDate from "~/models/ExpiryDate";
import IngredientModel from "~/models/Ingredient";
import type Ingredient from "~/models/Ingredient";
import { useIngredientStore } from "~/stores/ingredients";
import IngredientPicker from "./IngredientPicker.vue";

const store = useIngredientStore();
const { formatIngredient } = useIngredientFormatter();
const { t } = useI18n();

const modalElRef = ref<HTMLElement | null>(null);
let modalInstance: any = null;

const mode = ref<"create" | "edit">("create");
const originalId = ref<number | null>(null);

const selected = ref<Set<number>>(new Set());
const quantity = ref<number | null>(null);
const unit = ref("");
const expiry = ref("");

const saving = ref(false);
const deleting = ref(false);
const errorMessage = ref("");

const missing = ref<{ name: string; appears: number; ingredient_id: number }[]>([]);

const isEdit = computed(() => mode.value === "edit");

const ingredientId = computed<number | null>(() => {
    const it = selected.value.values().next();
    return it.done ? null : (it.value as number);
});

const selectedName = computed(() =>
    ingredientId.value === null ? "" : (formatIngredient(ingredientId.value) || "")
);

const canSubmit = computed(
    () =>
        ingredientId.value !== null &&
        unit.value !== "" &&
        expiry.value !== "" &&
        quantity.value !== null &&
        quantity.value > 0
);

const onPickerUpdate = (next: Set<number>) => {
    selected.value = next;
};

const selectIngredientById = (id: number) => {
    selected.value = new Set([id]);
};

const reset = () => {
    mode.value = "create";
    originalId.value = null;
    selected.value = new Set();
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
    if (prefillName) {
        const found = store.availableIngredients.find((i) =>
            formatIngredient(i.id) === prefillName || i.name === prefillName
        );
        if (found) selectIngredientById(found.id);
    }
    ensureModalInstance()?.show();
};

const openForEdit = async (ingredient: Ingredient) => {
    reset();
    if (!store.availableIngredients.length) {
        await store.loadAvailableIngredients();
    }
    mode.value = "edit";
    originalId.value = ingredient.id;
    selected.value = new Set([ingredient.id]);
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
            selectedName.value,
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
            err?.data?.message ?? err?.message ?? t("pantry.addModal.errors.saveFailed");
    } finally {
        saving.value = false;
    }
};

const handleDelete = async () => {
    if (!isEdit.value || originalId.value === null || deleting.value) return;
    if (!confirm(t("pantry.addModal.deleteConfirm"))) return;
    deleting.value = true;
    errorMessage.value = "";
    try {
        await store.removeIngredient(originalId.value);
        close();
        reset();
    } catch (err: any) {
        errorMessage.value =
            err?.data?.message ?? err?.message ?? t("pantry.addModal.errors.deleteFailed");
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
        <div class="modal-dialog modal-dialog-centered modal-xl ingredient-add-dialog">
            <div class="modal-content ingredient-add-modal">
                <div class="modal-header">
                    <div class="d-flex flex-column">
                        <h2 id="ingredientAddModalLabel" class="modal-title fs-4 mb-1">
                            {{ isEdit ? t('pantry.addModal.title.edit') : t('pantry.addModal.title.create') }}
                        </h2>
                        <p class="mb-0 text-muted small">
                            {{ isEdit ? t('pantry.addModal.subtitle.edit') : t('pantry.addModal.subtitle.create') }}
                        </p>
                    </div>
                    <button
                        type="button"
                        class="btn-close ms-3"
                        data-bs-dismiss="modal"
                        :aria-label="t('common.actions.close')"
                    ></button>
                </div>

                <div class="modal-body p-0">
                    <div class="spread row g-0">
                        <div class="col-lg-6 spread-pane spread-left">
                            <p class="spread-eyebrow">{{ t('pantry.addModal.spread.pickEyebrow') }}</p>
                            <h4 class="spread-section-title">
                                {{ t('pantry.addModal.spread.pickTitle') }}
                            </h4>
                            <IngredientPicker
                                :selected="selected"
                                :multiple="false"
                                :placeholder="t('pantry.addModal.spread.searchPlaceholder')"
                                min-height="320px"
                                max-height="46vh"
                                @update:selected="onPickerUpdate"
                            />
                        </div>

                        <div class="col-lg-6 spread-pane spread-right">
                            <p class="spread-eyebrow">{{ t('pantry.addModal.spread.fillEyebrow') }}</p>
                            <h2 class="spread-name" :class="{ 'is-empty': !selectedName }">
                                {{ selectedName || t('pantry.addModal.spread.namePlaceholder') }}
                            </h2>

                            <div class="spread-divider" aria-hidden="true"></div>

                            <form class="card-form" @submit.prevent="handleSave">
                                <div class="row g-3">
                                    <div class="col-12">
                                        <label class="form-label small fw-semibold" for="addExpiry">
                                            {{ t('pantry.addModal.fields.expiry') }}
                                        </label>
                                        <input id="addExpiry" v-model="expiry" type="date" class="form-control"/>
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label small fw-semibold" for="addQty">
                                            {{ t('pantry.addModal.fields.quantityUnit') }}
                                        </label>
                                        <div class="input-group">
                                            <input
                                                id="addQty"
                                                v-model.number="quantity"
                                                type="number"
                                                class="form-control"
                                                placeholder="10"
                                                min="0"
                                                step="any"
                                            />
                                            <select v-model="unit" class="form-select unit-select" :aria-label="t('pantry.addModal.fields.unitPlaceholder')">
                                                <option value="" disabled>{{ t('pantry.addModal.fields.unitPlaceholder') }}</option>
                                                <option v-for="u in store.units" :key="u" :value="u">{{ u }}</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </form>

                            <section v-if="!isEdit && missing.length" class="suggestions-section">
                                <div class="spread-divider" aria-hidden="true"></div>
                                <header class="suggestions-head">
                                    <p class="suggestions-title mb-0">
                                        <i class="bi bi-stars me-2" aria-hidden="true"></i>
                                        {{ t('pantry.addModal.suggestions.title') }}
                                    </p>
                                    <span class="suggestions-hint">{{ t('pantry.addModal.suggestions.hint') }}</span>
                                </header>
                                <div class="suggestion-pills">
                                    <button
                                        v-for="item in missing.slice(0, 8)"
                                        :key="item.ingredient_id"
                                        type="button"
                                        class="suggestion-pill"
                                        :class="{ active: ingredientId === item.ingredient_id }"
                                        @click="selectIngredientById(item.ingredient_id)"
                                    >
                                        <i class="bi bi-plus-circle me-1" aria-hidden="true"></i>
                                        {{ formatIngredient(item.ingredient_id) }}
                                    </button>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>

                <div class="modal-footer flex-column align-items-stretch gap-2">
                    <p v-if="errorMessage" class="text-danger small mb-0">{{ errorMessage }}</p>
                    <div class="d-flex justify-content-between align-items-center gap-2 flex-wrap">
                        <button
                            v-if="isEdit"
                            type="button"
                            class="btn btn-delete"
                            :disabled="deleting || saving"
                            @click="handleDelete"
                        >
                            <i class="bi bi-trash3 me-1" aria-hidden="true"></i>
                            {{ deleting ? t('common.actions.deleting') : t('common.actions.delete') }}
                        </button>
                        <div v-else></div>

                        <div class="d-flex gap-2 flex-wrap">
                            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                                {{ t('common.actions.cancel') }}
                            </button>
                            <Button
                                color="orange"
                                :disabled="!canSubmit || saving || deleting"
                                @click="handleSave"
                            >
                                {{ saving ? t('common.actions.saving') : t('common.actions.save') }}
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

.spread {
    align-items: stretch;
}

.spread-pane {
    padding: 1.25rem 1.5rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
}

@media (min-width: 992px) {
    .spread-left {
        border-right: 1.5px dotted var(--accent-border);
    }
}

@media (max-width: 991.98px) {
    .spread-left {
        border-bottom: 1.5px dotted var(--accent-border);
    }
}

.spread-eyebrow {
    margin: 0;
    font-family: "Caveat", cursive;
    font-weight: 600;
    font-size: 22px;
    color: var(--bs-secondary-color);
    line-height: 1;
}

.spread-section-title {
    font-family: "Caveat Brush", cursive;
    font-size: 28px;
    margin: 0;
    color: var(--bs-emphasis-color);
    text-transform: uppercase;
    letter-spacing: 0.02em;
    line-height: 1.05;
}

.spread-name {
    font-family: "Caveat Brush", cursive;
    font-size: clamp(1.9rem, 3.6vw, 2.4rem);
    margin: 0;
    text-transform: uppercase;
    color: var(--bs-emphasis-color);
    letter-spacing: 0.02em;
    line-height: 1.05;
    word-break: break-word;
}

.spread-name.is-empty {
    color: var(--bs-secondary-color);
    font-family: "Caveat", cursive;
    font-style: italic;
    text-transform: none;
    letter-spacing: 0;
    font-weight: 600;
    font-size: clamp(1.4rem, 2.6vw, 1.7rem);
}

.spread-divider {
    border: 0;
    border-top: 1.5px dotted var(--accent-border);
    height: 0;
    margin: 6px 0;
    opacity: 0.85;
}

.card-form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
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
    margin-top: 0.25rem;
}

.suggestions-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.65rem;
    flex-wrap: wrap;
}

.suggestions-title {
    font-weight: 700;
    color: var(--bs-emphasis-color);
    display: inline-flex;
    align-items: center;
}

.suggestions-title i { color: var(--orange); }
.suggestions-hint { font-size: 11px; color: var(--bs-secondary-color); }

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
</style>
