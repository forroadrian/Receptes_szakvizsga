<script setup lang="ts">
import { computed, ref, reactive, watchEffect, onMounted, watch } from "vue";
import { useRecipeModal } from "~/composables/useRecipeModal";
import AppSwitch from "~/components/Switch.vue";
import IngredientTreePicker from "~/components/Ingredient/IngredientTreePicker.vue";

const recipeModal = useRecipeModal();
const { t } = useI18n();
const { formatUnit } = useUnitFormatter();
const { formatIngredient } = useIngredientFormatter();
const { formatCategory } = useCategoryFormatter();
const closeBtn = ref<HTMLButtonElement | null>(null);

const stepHasIssue: Record<number, boolean> = reactive({
    1: false, 2: false, 3: false, 4: false
});

watchEffect(() => {
    stepHasIssue[1] = recipeModal.nameEmpty || recipeModal.nameBadChars || recipeModal.nameTooLong || recipeModal.descEmpty || recipeModal.descBadChars || recipeModal.descTooLong || recipeModal.timeBad || recipeModal.servingsBad;
    stepHasIssue[2] = recipeModal.noMealType;
    stepHasIssue[3] = recipeModal.tooFewIngredients;
    stepHasIssue[4] = recipeModal.tooFewSteps;
});

const steps = computed(() => [
    { id: 1, title: t('recipe.addRecipeModal.steps.description') },
    { id: 2, title: t('recipe.addRecipeModal.steps.type') },
    { id: 3, title: t('recipe.addRecipeModal.steps.ingredients') },
    { id: 4, title: t('recipe.addRecipeModal.steps.instructions') }
]);

const aiPendingOpen = useState<boolean>('aiPendingOpen', () => false);

onMounted(() => {
    recipeModal.init();
    recipeModal.closeButton = closeBtn.value;

    const modalEl = document.getElementById('openAddRecipeModal');
    modalEl?.addEventListener('hidden.bs.modal', () => recipeModal.onModalHidden());
});

watch(aiPendingOpen, async (val) => {
    if (!val) return;
    aiPendingOpen.value = false;
    await nextTick();
    setTimeout(() => {
        const modalEl = document.getElementById('openAddRecipeModal');
        if (modalEl) (window as any).bootstrap.Modal.getOrCreateInstance(modalEl).show();
    }, 150);
}, { immediate: true });

watch(closeBtn, (btn) => {
    recipeModal.closeButton = btn;
});

watch(() => recipeModal.isSaving, (saving, wasSaving) => {
    if (wasSaving && !saving && !recipeModal.errorMessage) {
        closeBtn.value?.click();
    }
});

const currentStep = ref(1);
const draggedInstructionIndex = ref<number | null>(null);

const progress = computed(() => `${(currentStep.value / steps.value.length) * 100}%`);
const canGoBack = computed(() => currentStep.value > 1);
const canGoNext = computed(() => currentStep.value < steps.value.length);

function nextStep() { if (canGoNext.value) currentStep.value++; }
function prevStep() { if (canGoBack.value) currentStep.value--; }
function goToStep(id: number) { currentStep.value = id; }

function onInstructionDragStart(index: number) { draggedInstructionIndex.value = index; }

function onInstructionDrop(targetIndex: number) {
    if (draggedInstructionIndex.value === null || draggedInstructionIndex.value === targetIndex) {
        draggedInstructionIndex.value = null;
        return;
    }
    const instructions = recipeModal.recipe.instructions;
    const moved = instructions[draggedInstructionIndex.value];
    if (!moved) { draggedInstructionIndex.value = null; return; }
    instructions.splice(draggedInstructionIndex.value, 1);
    instructions.splice(targetIndex, 0, moved);
    draggedInstructionIndex.value = null;
}

function onInstructionDragEnd() { draggedInstructionIndex.value = null; }
</script>

<template>
    <ClientOnly>
    <div id="openAddRecipeModal" class="modal fade" tabindex="-1" aria-labelledby="openAddRecipeModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-xl recipe-dialog">
            <div class="modal-content recipe-modal">
                <div class="modal-header recipe-modal-header">
                    <div class="w-100 d-flex align-items-start justify-content-between gap-3 flex-wrap">
                        <div>
                            <h2 id="openAddRecipeModalLabel" class="modal-title fs-3 mb-1">
                                {{ recipeModal.isEditMode ? $t('recipe.addRecipeModal.titleEdit') : $t('recipe.addRecipeModal.title') }}
                            </h2>
                            <p>{{ recipeModal.isEditMode ? $t('recipe.addRecipeModal.subtitleEdit') : $t('recipe.addRecipeModal.subtitle') }}</p>
                        </div>

                        <div class="recipe-progress-meta text-end">
                            <p>{{ $t('recipe.addRecipeModal.stepCount', { current: currentStep, total: steps.length }) }}</p>
                            <div class="recipe-progress">
                                <span class="recipe-progress-bar d-block" :style="{ width: progress }"></span>
                            </div>
                        </div>
                    </div>

                    <button ref="closeBtn" type="button" class="btn-close ms-3" data-bs-dismiss="modal" :aria-label="$t('common.actions.close')"></button>
                </div>

                <div class="modal-body p-0">
                    <div class="container-fluid">
                         <div v-if="recipeModal.firstError && !recipeModal.canSubmit" class="yellow mx-5 p-2 rounded-3 fw-bold mt-4 mb-0 d-block">
                                        <i class="bi bi-exclamation-triangle-fill me-2"></i>{{  $t(recipeModal.firstError, recipeModal.LIMITS) }}
                                    </div>
                                    <div v-else-if="recipeModal.errorMessage" class="alert alert-danger mt-4 mb-0 d-block">
                                        {{ recipeModal.errorMessage }}
                                    </div>
                        <div class="row g-0 recipe-layout">
                            <div class="col-lg-6 col-md-5 col-sm-12 recipe-sidebar-wrap">
                                <aside class="recipe-sidebar h-100">
                                    <div class="recipe-card">
                                        <div v-for="(step, index) in steps"
                                            class="step-btn text-start position-relative"
                                            :class="{ active: currentStep === step.id }" @click="goToStep(step.id)">
                                            <span class="step-index yellow">{{ step.id }}</span>

                                            <span class="step-text">
                                                <span class="fw-semibold d-block">{{ step.title }}</span>
                                                <small class="text-muted">{{ $t('recipe.addRecipeModal.stepLabel', { step: step.id }) }}</small>
                                            </span>

                                            <i v-if="stepHasIssue[step.id]" class="bi bi-exclamation-triangle-fill step-warning-icon"></i>
                                            <span v-if="index < steps.length - 1" class="step-line"></span>
                                        </div>
                                    </div>

                                    <div class="recipe-card recipe-summary-card mt-4">
                                        <div v-if="recipeModal.displayImageUrl" class="summary-image mb-3 text-center">
                                            <img :src="recipeModal.displayImageUrl" alt="Recept kép" class= "w-25" />
                                        </div>

                                        <div class="summary-row">
                                            <span>{{ $t('recipe.addRecipeModal.summary.name') }}</span>
                                            <strong class="summary-value":class="{ 'text-danger': recipeModal.nameBadChars || recipeModal.nameTooLong, 'text-warning': recipeModal.nameEmpty }"
                                                :title="recipeModal.recipe.name">
                                                <i v-if="recipeModal.nameEmpty || recipeModal.nameBadChars || recipeModal.nameTooLong" class="bi bi-exclamation-triangle-fill me-1"></i>
                                                {{ recipeModal.recipe.name || $t('recipe.addRecipeModal.summary.empty') }}
                                            </strong>
                                        </div>

                                        <div class="summary-row">
                                            <span>{{ $t('recipe.addRecipeModal.summary.meal') }}</span>
                                            <strong class="summary-value":class="{ 'text-warning': recipeModal.noMealType }">
                                                <i v-if="recipeModal.noMealType"
                                                    class="bi bi-exclamation-triangle-fill me-1"></i>
                                                {{ recipeModal.selectedMealType ?
                                                    formatCategory(recipeModal.selectedMealType.id) :
                                                    $t('recipe.addRecipeModal.summary.empty') }}
                                            </strong>
                                        </div>

                                        <div class="summary-row">
                                            <span>{{ $t('recipe.addRecipeModal.summary.ingredient') }}</span>
                                            <strong :class="{ 'text-danger': recipeModal.tooFewIngredients || recipeModal.tooManyIngredients }">
                                                <i v-if="recipeModal.tooFewIngredients" class="bi bi-exclamation-triangle-fill me-1"></i>
                                                <template v-if="recipeModal.tooManyIngredients">{{ recipeModal.ingredientCount }}/
                                                    {{recipeModal.LIMITS.ingredientsMax }}</template>
                                                <template v-else>{{ recipeModal.ingredientCount }}</template>
                                            </strong>
                                        </div>

                                        <div class="summary-row">
                                            <span>{{ $t('recipe.addRecipeModal.summary.step') }}</span>
                                            <strong :class="{ 'text-danger': recipeModal.tooFewSteps || recipeModal.tooManySteps }">
                                                <i v-if="recipeModal.tooFewSteps" class="bi bi-exclamation-triangle-fill me-1"></i>
                                                <template v-if="recipeModal.tooManySteps">
                                                    {{ recipeModal.stepCount}}/{{ recipeModal.LIMITS.stepsMax }}
                                                </template>
                                                <template v-else>{{ recipeModal.stepCount }}</template>
                                            </strong>
                                        </div>
                                    </div>
                                </aside>
                            </div>

                            <div class="col-lg-6 col-md-7">
                                <div class="recipe-content">
                                    <div v-if="currentStep === 1" class="recipe-card recipe-panel d-flex flex-column gap-4">
                                        <div>
                                            <label class="form-label">{{ $t('recipe.addRecipeModal.form.image') ?? 'Recept kép' }}</label>
                                            <div v-if="recipeModal.displayImageUrl" class="recipe-image-preview mb-2 text-center">
                                                <img :src="recipeModal.displayImageUrl" alt="Recept kép" class="recipe-image w-50 mb-3" />

                                                <Button type="button" icon="bi bi-x-lg" color="orange" class="recipe-image-delete w-100" @click="recipeModal.removeImage" 
                                                :title="$t('common.actions.delete') ?? 'Törlés'">{{ $t('recipe.addRecipeModal.form.imageDelete') }}
                                                </Button>
                                            </div>
                                            <input v-else type="file"  accept="image/*" class="form-control" @change="recipeModal.onImageSelected">
                                            <small v-if="recipeModal.errorMessage" class="text-danger">{{ recipeModal.errorMessage }}</small>
                                        </div>
                                        <div>
                                            <label class="form-label">{{ $t('recipe.addRecipeModal.form.name') }}</label>
                                            <input v-model="recipeModal.recipe.name" type="text" class="form-control"
                                                :class="{ 'is-invalid': recipeModal.nameBadChars || recipeModal.nameTooLong }"
                                                :maxlength="recipeModal.LIMITS.nameMax"
                                                :placeholder="$t('recipe.addRecipeModal.form.namePlaceholder')">

                                            <div class="d-flex justify-content-between mt-1">
                                                <small v-if="recipeModal.nameBadChars"  class="text-danger d-block">{{$t('recipe.validation.name.invalidChars') }}</small>
                                                <small v-else>&nbsp;</small>
                                                <small :class="recipeModal.nameTooLong ? 'text-danger fw-semibold' : 'text-muted'">
                                                    {{ recipeModal.nameLength }}/{{ recipeModal.LIMITS.nameMax }}
                                                </small>
                                            </div>
                                        </div>

                                        <div>
                                            <label class="form-label">{{ $t('recipe.addRecipeModal.form.description') }}</label>
                                            <textarea v-model="recipeModal.recipe.description" rows="5" class="form-control"
                                                :class="{ 'is-invalid': recipeModal.descBadChars || recipeModal.descTooLong }"
                                                :maxlength="recipeModal.LIMITS.descMax"
                                                :placeholder="$t('recipe.addRecipeModal.form.descriptionPlaceholder')"></textarea>

                                            <div class="d-flex justify-content-between mt-1">
                                                <small v-if="recipeModal.descBadChars"
                                                    class="text-danger d-block">{{$t('recipe.validation.desc.invalidChars') }}</small>
                                                <small v-else>&nbsp;</small>
                                                <small :class="recipeModal.descTooLong ? 'text-danger fw-semibold' : 'text-muted'">
                                                    {{ recipeModal.descLength }}/{{ recipeModal.LIMITS.descMax }}
                                                </small>
                                            </div>
                                        </div>

                                        <div class="row g-3">
                                            <div class="col-md-6">
                                                <label class="form-label">{{ $t('recipe.addRecipeModal.form.prepTime') }}</label>
                                                <input v-model.number="recipeModal.recipe.prepTime" type="number"
                                                    :min="recipeModal.LIMITS.timeMin" :max="recipeModal.LIMITS.timeMax" step="1" class="form-control"
                                                    :class="{ 'is-invalid': recipeModal.timeBad && recipeModal.recipe.prepTime }">
                                                <small v-if="recipeModal.timeBad && recipeModal.recipe.prepTime" class="text-danger d-block mt-1">
                                                    {{ $t('recipe.validation.time.range', recipeModal.LIMITS) }}
                                                </small>
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label">{{$t('recipe.addRecipeModal.form.servings') }}</label>
                                                <input v-model.number="recipeModal.recipe.servings" type="number"  :min="recipeModal.LIMITS.servingsMin" :max="recipeModal.LIMITS.servingsMax" step="1"
                                                    class="form-control" :class="{ 'is-invalid': recipeModal.servingsBad && recipeModal.recipe.servings }">
                                                <small v-if="recipeModal.servingsBad && recipeModal.recipe.servings" class="text-danger d-block mt-1">
                                                    {{ $t('recipe.validation.servings.range', recipeModal.LIMITS) }}
                                                </small>
                                            </div>
                                        </div>
                                    </div>

                                    <div v-else-if="currentStep === 2" class="recipe-card recipe-panel d-flex flex-column gap-4">
                                        <div>
                                            <label class="form-label d-block">{{ $t('recipe.addRecipeModal.form.meal') }}</label>
                                            <div class="d-flex flex-wrap gap-2">
                                                <Button v-for="meal in recipeModal.mealTypes" type="button" class="rounded-pill recipe-pill"
                                                    :color="recipeModal.recipe.mealType === meal.id ? 'yellow' : undefined"
                                                    @click="recipeModal.recipe.mealType = meal.id">
                                                    {{ formatCategory(meal.id) }}
                                                </Button>
                                            </div>
                                        </div>
                                        <div>
                                            <label class="form-label d-block">{{ $t('recipe.addRecipeModal.form.type') }}</label>
                                            <div class="d-flex flex-wrap gap-2">
                                                <Button v-for="tag in recipeModal.tags" type="button" class="rounded-pill recipe-pill"
                                                    :color="recipeModal.recipe.tags.includes(tag.id) ? 'yellow' : undefined"
                                                    @click="recipeModal.toggleTag(tag.id)">
                                                    {{ formatCategory(tag.id) }}
                                                </Button>
                                            </div>
                                        </div>
                                         <div class="visibility-toggle mt-5 " :class="{ public: recipeModal.recipe.isPublic }">
                                            <div class="visibility-icon">
                                                <i :class="recipeModal.recipe.isPublic ? 'bi bi-globe2' : 'bi bi-lock'"></i>
                                            </div>
                                            <div class="pb-3">
                                                <p class="fw-semibold mb-0">{{ recipeModal.recipe.isPublic ? $t('recipe.addRecipeModal.form.public') : $t('recipe.addRecipeModal.form.private') }}</p>
                                                <small class="text-secondary">{{ recipeModal.recipe.isPublic ? $t('recipe.addRecipeModal.form.publicDesc') : $t('recipe.addRecipeModal.form.privateDesc') }}</small>
                                            </div>
                                            <AppSwitch v-model="recipeModal.recipe.isPublic" />
                                        </div>
                                    </div>

                                    <div v-else-if="currentStep === 3" class="recipe-card recipe-panel ingredient-step d-flex flex-column gap-3">
                                        <header class="step-head">
                                            <div class="head-row">
                                                <label class="form-label mb-0 step-label">{{ $t('recipe.addRecipeModal.form.ingredient') }}</label>
                                                <small :class="recipeModal.tooManyIngredients ? 'text-danger fw-semibold' : 'text-muted'">
                                                    <template v-if="recipeModal.tooManyIngredients">{{ recipeModal.ingredientCount }}/{{ recipeModal.LIMITS.ingredientsMax }}</template>
                                                    <template v-else>{{ recipeModal.ingredientCount }}</template>
                                                </small>
                                            </div>

                                            <div v-if="!recipeModal.isEditingIngredient" class="mode-toggle" role="tablist"
                                                :aria-label="$t('recipe.addRecipeModal.picker.modeLabel')">
                                                <button type="button" role="tab" class="mode-btn"
                                                    :class="{ active: recipeModal.pickerMode === 'bulk' }"
                                                    :aria-selected="recipeModal.pickerMode === 'bulk'"
                                                    @click="recipeModal.switchPickerMode('bulk')">
                                                    <i class="bi bi-collection" aria-hidden="true"></i>
                                                    <span>{{ $t('recipe.addRecipeModal.picker.bulkMode') }}</span>
                                                </button>
                                                <button type="button" role="tab" class="mode-btn"
                                                    :class="{ active: recipeModal.pickerMode === 'single' }"
                                                    :aria-selected="recipeModal.pickerMode === 'single'"
                                                    @click="recipeModal.switchPickerMode('single')">
                                                    <i class="bi bi-cursor" aria-hidden="true"></i>
                                                    <span>{{ $t('recipe.addRecipeModal.picker.singleMode') }}</span>
                                                </button>
                                            </div>
                                        </header>

                                        <div class="tree-search">
                                            <i class="bi bi-search tree-search-icon" aria-hidden="true"></i>
                                            <input v-model="recipeModal.treeQuery" type="text"
                                                class="tree-search-input"
                                                autocomplete="off" spellcheck="false"
                                                :placeholder="$t('recipe.addRecipeModal.picker.searchPlaceholder')"
                                                :aria-label="$t('recipe.addRecipeModal.picker.searchPlaceholder')" />
                                            <button v-if="recipeModal.treeQuery" type="button" class="tree-search-clear"
                                                :aria-label="$t('ingredientPicker.clearSearch')"
                                                @click="recipeModal.treeQuery = ''">
                                                <i class="bi bi-x-lg" aria-hidden="true"></i>
                                            </button>
                                        </div>
                                        <div class="tree-wrap">
                                            <IngredientTreePicker v-if="recipeModal.effectivePickerMode === 'bulk'"
                                                :nodes="recipeModal.taxonomyTree"
                                                :selected="recipeModal.bulkSelectedSet"
                                                :multiple="true"
                                                :query="recipeModal.treeQuery"
                                                @update:selected="recipeModal.onBulkPickerUpdate" />
                                            <IngredientTreePicker v-else
                                                :nodes="recipeModal.taxonomyTree"
                                                :selected="recipeModal.singleSelectedSet"
                                                :multiple="false"
                                                :query="recipeModal.treeQuery"
                                                @update:selected="recipeModal.onSinglePickerUpdate" />
                                        </div>

                                        <div class="step-divider" aria-hidden="true"></div>

                                        <section v-if="recipeModal.effectivePickerMode === 'bulk'" class="bulk-panel">
                                            <header class="panel-head">
                                                <h4 class="panel-title">{{ $t('recipe.addRecipeModal.picker.bulkFillTitle') }}</h4>
                                                <span v-if="recipeModal.hasBulkRows" class="panel-hint">
                                                    {{ $t('recipe.addRecipeModal.picker.bulkSelectedCount', { n: recipeModal.bulkRows.length }) }}
                                                </span>
                                            </header>

                                            <p v-if="!recipeModal.hasBulkRows" class="bulk-empty">
                                                {{ $t('recipe.addRecipeModal.picker.bulkEmpty') }}
                                            </p>

                                            <div v-else class="bulk-rows">
                                                <div v-for="(row, idx) in recipeModal.bulkRows" :key="`b-${row.ingredient_id}`" class="bulk-row"
                                                    :class="{ invalid: !row.quantity || row.quantity <= 0 || !row.unit }">
                                                    <span class="bulk-name" :title="formatIngredient(row.ingredient_id)">
                                                        {{ formatIngredient(row.ingredient_id) }}
                                                    </span>
                                                    <input v-model.number="row.quantity" type="number" min="0" step="any"
                                                        class="form-control form-control-sm bulk-qty"
                                                        :aria-label="$t('recipe.addRecipeModal.form.quantity')" />
                                                    <select v-model="row.unit" class="form-select form-select-sm bulk-unit"
                                                        :aria-label="$t('recipe.addRecipeModal.form.unit')">
                                                        <option v-for="u in recipeModal.availableUnits" :key="u" :value="u">{{ formatUnit(u) }}</option>
                                                    </select>
                                                    <button type="button" class="bulk-remove"
                                                        :aria-label="$t('common.actions.delete')"
                                                        @click="recipeModal.removeBulkRow(idx)">
                                                        <i class="bi bi-x-lg" aria-hidden="true"></i>
                                                    </button>
                                                </div>
                                            </div>

                                            <div v-if="recipeModal.hasBulkRows" class="bulk-actions">
                                                <Button type="button" outline class="bulk-clear-btn" @click="recipeModal.clearBulkSelection">
                                                    {{ $t('recipe.addRecipeModal.picker.bulkClear') }}
                                                </Button>
                                                <Button type="button" color="green" class="bulk-commit-btn"
                                                    :disabled="recipeModal.bulkInvalidRowCount > 0"
                                                    @click="recipeModal.commitBulkIngredients">
                                                    <i class="bi bi-plus-lg me-1" aria-hidden="true"></i>
                                                    {{ $t('recipe.addRecipeModal.picker.bulkCommit', { n: recipeModal.bulkRows.length }) }}
                                                </Button>
                                            </div>
                                        </section>

                                        <section v-else class="single-panel">
                                            <p class="single-eyebrow">
                                                {{ recipeModal.isEditingIngredient
                                                    ? $t('recipe.addRecipeModal.picker.editingEyebrow')
                                                    : $t('recipe.addRecipeModal.picker.singleEyebrow') }}
                                            </p>
                                            <h2 class="single-name" :class="{ 'is-empty': !recipeModal.hasSelectedIngredient }">
                                                {{ recipeModal.hasSelectedIngredient && recipeModal.selectedIngredientId !== null
                                                    ? formatIngredient(recipeModal.selectedIngredientId)
                                                    : $t('recipe.addRecipeModal.picker.singleEmpty') }}
                                            </h2>

                                            <div class="row g-2 mt-1">
                                                <div class="col-6">
                                                    <label class="form-label form-label-sm">{{ $t('recipe.addRecipeModal.form.quantity') }}</label>
                                                    <input v-model.number="recipeModal.selectedIngredientQuantity" type="number" min="0" step="any" class="form-control form-control-sm" />
                                                </div>
                                                <div class="col-6">
                                                    <label class="form-label form-label-sm">{{ $t('recipe.addRecipeModal.form.unit') }}</label>
                                                    <select v-model="recipeModal.selectedIngredientUnit" class="form-select form-select-sm">
                                                        <option v-for="u in recipeModal.availableUnits" :key="u" :value="u">{{ formatUnit(u) }}</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div class="single-actions">
                                                <Button v-if="recipeModal.hasSelectedIngredient" type="button" color="green" class="single-action-btn"
                                                    :disabled="!recipeModal.isEditingIngredient && recipeModal.tooManyIngredients"
                                                    @click="recipeModal.addOrUpdateIngredient">
                                                    {{ recipeModal.isEditingIngredient ? $t('recipe.addRecipeModal.form.saveEdit') : $t('recipe.addRecipeModal.form.add') }}
                                                </Button>
                                                <Button v-if="recipeModal.isEditingIngredient" type="button" outline class="single-cancel-btn" @click="recipeModal.cancelIngredientEdit">
                                                    {{ $t('recipe.addRecipeModal.form.cancel') }}
                                                </Button>
                                            </div>
                                        </section>

                                        <section class="added-section">
                                            <div class="step-divider" aria-hidden="true"></div>
                                            <header class="panel-head">
                                                <h4 class="panel-title">{{ $t('recipe.addRecipeModal.picker.addedTitle') }}</h4>
                                                <span v-if="recipeModal.recipe.ingredients.length" class="panel-hint">
                                                    {{ $t('recipe.addRecipeModal.picker.addedCount', { n: recipeModal.recipe.ingredients.length }) }}
                                                </span>
                                            </header>

                                            <div v-if="recipeModal.recipe.ingredients.length === 0" class="empty-state">
                                                {{ $t('recipe.addRecipeModal.form.noIngredients') }}
                                            </div>

                                            <ul v-else class="added-list">
                                                <li v-for="(ingredient, index) in recipeModal.recipe.ingredients"
                                                    :key="`a-${index}-${ingredient.ingredient_id}`" class="added-item"
                                                    :class="{ editing: recipeModal.editingIngredientIndex === index }">
                                                    <span class="added-name">{{ formatIngredient(ingredient.ingredient_id) }}</span>
                                                    <span class="added-amount">{{ ingredient.quantity }} {{ formatUnit(ingredient.unit) }}</span>
                                                    <div class="added-actions">
                                                        <Button type="button" color="yellow" icon="bi bi-pencil-square" icon-only @click="recipeModal.editIngredient(index)"></Button>
                                                        <Button type="button" color="orange" icon="bi bi-trash" icon-only @click="recipeModal.removeIngredient(index)"></Button>
                                                    </div>
                                                </li>
                                            </ul>
                                        </section>
                                    </div>

                                    <div v-else-if="currentStep === 4" class="recipe-card recipe-panel d-flex flex-column gap-4">
                                        <div class="d-flex justify-content-between align-items-center">
                                            <label class="form-label mb-0">{{$t('recipe.addRecipeModal.steps.instructions') }}</label>
                                            <small :class="recipeModal.tooManySteps ? 'text-danger fw-semibold' : 'text-muted'">
                                                <template v-if="recipeModal.tooManySteps">{{ recipeModal.stepCount
                                                    }}/{{ recipeModal.LIMITS.stepsMax }}</template>
                                                <template v-else>{{ recipeModal.stepCount }}</template>
                                            </small>
                                        </div>

                                        <div class="row g-2">
                                            <div class="col-12 col-md">
                                                <input v-model="recipeModal.instructionInput" type="text" class="form-control h-100" 
                                                    :class="{ 'is-invalid': recipeModal.stepInputErr }" :maxlength="recipeModal.LIMITS.stepMaxChars"
                                                    :placeholder="$t('recipe.addRecipeModal.form.instructionPlaceholder')">

                                                <div class="d-flex justify-content-between mt-1">
                                                    <small v-if="recipeModal.stepInputErr"class="text-danger d-block">
                                                        {{$t(recipeModal.stepInputErr, recipeModal.LIMITS) }}
                                                    </small>
                                                    <small v-else>&nbsp;</small>
                                                    <small v-if="recipeModal.instructionInput.trim()"class="text-muted">
                                                        {{ recipeModal.instructionInput.length }}/{{recipeModal.LIMITS.stepMaxChars }}
                                                    </small>
                                                </div>
                                            </div>

                                            <div class="col-12 col-md-auto">
                                                <Button type="button" color="green" class="w-100" @click="recipeModal.addOrUpdateInstruction"
                                                    :disabled="!recipeModal.canAddStep || (!recipeModal.isEditingInstruction && recipeModal.tooManySteps)">
                                                    {{ $t('recipe.addRecipeModal.form.addInstruction') }}
                                                </Button>
                                            </div>
                                        </div>

                                        <div class="instruction-list d-flex flex-column gap-2">
                                            <div v-if="recipeModal.recipe.instructions.length === 0" class="empty-state">
                                                {{ $t('recipe.addRecipeModal.form.noInstructions') }}
                                            </div>

                                            <div v-for="(instruction, index) in recipeModal.recipe.instructions"
                                                class="instruction-item d-flex align-items-center justify-content-between gap-3"
                                                draggable="true" @dragstart="onInstructionDragStart(index)"
                                                @dragover.prevent @drop="onInstructionDrop(index)" @dragend="onInstructionDragEnd">
                                                <div class="d-flex align-items-center gap-3">
                                                    <span class="drag-handle"><i class="bi bi-arrow-down-up"></i></span>
                                                    <strong>{{ index + 1 }}.</strong>
                                                    <span>{{ instruction }}</span>
                                                </div>
                                                <div class="d-flex align-items-center gap-3">
                                                    <Button type="button" color="yellow" icon="bi bi-pencil-square" icon-only
                                                        @click="recipeModal.editInstruction(index)"></Button>
                                                    <Button type="button" color="orange" icon="bi bi-trash" icon-only
                                                        @click="recipeModal.removeInstruction(index)"></Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer recipe-modal-footer">
                    <Button type="button" class="btn-outline-secondary" :disabled="!canGoBack || recipeModal.isSaving" @click="prevStep">
                        {{ $t('recipe.addRecipeModal.footer.back') }}
                    </Button>

                    <Button v-if="canGoNext" type="button" color="yellow" :disabled="recipeModal.isSaving" @click="nextStep">
                        {{ $t('recipe.addRecipeModal.footer.next') }}
                    </Button>

                    <Button v-else type="button" color="green" :disabled="!recipeModal.canSubmit || recipeModal.isSaving || recipeModal.imageUploading"
                     @click="recipeModal.saveRecipe"> {{ recipeModal.imageUploading ?
                     ($t('recipe.addRecipeModal.footer.uploadingImage') ?? 'Kép eltöltése...') :
                        recipeModal.isSaving ? $t('recipe.addRecipeModal.footer.saving') :
                    (recipeModal.isEditMode ? $t('recipe.addRecipeModal.footer.edit') :
                        $t('recipe.addRecipeModal.footer.create')) }}
                    </Button>
                </div>
            </div>
        </div>
    </div>
    </ClientOnly>
</template>
<style scoped src="@/assets/css/recipeModal.css"> </style>

<style scoped>
.ingredient-step {
    overflow: visible;
}

.step-head {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.head-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
}

.step-label {
    font-family: "Caveat Brush", cursive;
    font-size: 24px;
    color: var(--bs-emphasis-color);
    text-transform: uppercase;
    letter-spacing: 0.02em;
    line-height: 1;
}

.mode-toggle {
    display: inline-flex;
    align-self: flex-start;
    background: var(--segmentation-bg);
    border-radius: var(--radius-sm);
    padding: 3px;
    gap: 2px;
    border: 1.5px solid var(--accent-border);
}

.mode-btn {
    background: transparent;
    border: 0;
    padding: 6px 14px;
    font-size: 13px;
    font-weight: 600;
    color: var(--bs-secondary-color);
    border-radius: 9px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: background 140ms ease, color 140ms ease, box-shadow 140ms ease;
}

.mode-btn:hover {
    color: var(--bs-emphasis-color);
}

.mode-btn.active {
    background: var(--bs-body-bg);
    color: var(--bs-emphasis-color);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.mode-btn i {
    font-size: 14px;
}

[data-bs-theme="dark"] .mode-toggle {
    background: rgba(255, 177, 94, 0.08);
    border-color: rgba(214, 188, 142, 0.4);
}

[data-bs-theme="dark"] .mode-btn.active {
    background: var(--bs-body-bg);
}

.step-divider {
    border-top: 1.5px dotted var(--accent-border);
    margin: 4px 0;
    opacity: 0.85;
    height: 0;
}

.tree-search {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: var(--bs-body-bg);
    border: 1.5px solid var(--bs-border-color);
    border-radius: var(--radius-sm);
    transition: border-color 140ms ease, box-shadow 140ms ease;
}

.tree-search:focus-within {
    border-color: var(--accent-border);
    box-shadow: 0 0 0 3px var(--accent-shadow);
}

.tree-search-icon {
    color: var(--bs-secondary-color);
    font-size: 14px;
    flex: 0 0 auto;
}

.tree-search-input {
    flex: 1;
    border: 0;
    outline: none;
    background: transparent;
    color: var(--bs-body-color);
    font: inherit;
    font-size: 14px;
    min-width: 0;
}

.tree-search-input::placeholder {
    color: var(--bs-secondary-color);
    font-style: italic;
}

.tree-search-clear {
    width: 24px;
    height: 24px;
    display: inline-grid;
    place-items: center;
    background: transparent;
    border: 0;
    border-radius: 50%;
    color: var(--bs-secondary-color);
    cursor: pointer;
    transition: background 120ms ease, color 120ms ease;
}

.tree-search-clear:hover {
    background: var(--accent-soft);
    color: var(--orange);
}

.tree-wrap {
    min-height: 240px;
    max-height: 34vh;
    overflow-y: auto;
    padding: 4px 4px 4px 0;
}

.tree-wrap::-webkit-scrollbar {
    width: 8px;
}

.tree-wrap::-webkit-scrollbar-thumb {
    background: var(--accent-soft-strong);
    border-radius: 8px;
}

.tree-wrap::-webkit-scrollbar-thumb:hover {
    background: var(--pill-primary);
}

.panel-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 8px;
}

.panel-title {
    margin: 0;
    font-family: "Caveat", cursive;
    font-weight: 600;
    font-size: 22px;
    color: var(--bs-emphasis-color);
    line-height: 1;
}

.panel-hint {
    font-size: 12px;
    color: var(--bs-secondary-color);
    font-weight: 500;
}

.bulk-empty {
    margin: 0;
    padding: 12px;
    text-align: center;
    color: var(--bs-secondary-color);
    background: var(--bs-tertiary-bg);
    border-radius: var(--radius-sm);
    font-size: 14px;
    font-style: italic;
}

.bulk-rows {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 28vh;
    overflow-y: auto;
    padding-right: 2px;
}

.bulk-row {
    display: grid;
    grid-template-columns: 1fr 80px 90px 32px;
    gap: 6px;
    align-items: center;
    padding: 6px 8px;
    border: 1px solid var(--bs-border-color);
    border-radius: var(--radius-sm);
    background: var(--bs-body-bg);
    transition: border-color 120ms ease, background 120ms ease;
}

.bulk-row.invalid {
    border-color: #d64545;
    background: rgba(214, 69, 69, 0.06);
}

.bulk-name {
    font-weight: 600;
    color: var(--bs-emphasis-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 14px;
}

.bulk-qty,
.bulk-unit {
    font-size: 13px;
}

.bulk-remove {
    width: 28px;
    height: 28px;
    display: inline-grid;
    place-items: center;
    border: 0;
    background: transparent;
    color: var(--bs-secondary-color);
    border-radius: 50%;
    cursor: pointer;
    transition: background 120ms ease, color 120ms ease;
    font-size: 12px;
}

.bulk-remove:hover {
    background: rgba(214, 69, 69, 0.1);
    color: #d64545;
}

.bulk-actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
}

.bulk-clear-btn {
    flex-shrink: 0;
}

.bulk-commit-btn {
    flex: 1;
}

.single-panel {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.single-eyebrow {
    margin: 0;
    font-family: "Caveat", cursive;
    font-weight: 600;
    font-size: 22px;
    color: var(--bs-secondary-color);
    line-height: 1;
}

.single-name {
    font-family: "Caveat Brush", cursive;
    font-size: clamp(1.6rem, 3.4vw, 2rem);
    margin: 0;
    text-transform: uppercase;
    color: var(--bs-emphasis-color);
    letter-spacing: 0.02em;
    line-height: 1.05;
    word-break: break-word;
}

.single-name.is-empty {
    color: var(--bs-secondary-color);
    font-family: "Caveat", cursive;
    font-style: italic;
    text-transform: none;
    letter-spacing: 0;
    font-weight: 600;
    font-size: clamp(1.15rem, 2.4vw, 1.45rem);
}

.single-actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
}

.single-action-btn {
    flex: 1;
}

.single-cancel-btn {
    flex-shrink: 0;
}

.added-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.added-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 24vh;
    overflow-y: auto;
}

.added-item {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 10px;
    align-items: center;
    padding: 8px 10px;
    border: 1px solid var(--bs-border-color);
    border-radius: var(--radius-sm);
    background: var(--bs-body-bg);
    transition: border-color 120ms ease, background 120ms ease;
}

.added-item.editing {
    border-color: var(--orange);
    background: var(--accent-soft);
}

.added-name {
    font-weight: 600;
    color: var(--bs-emphasis-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.added-amount {
    color: var(--bs-secondary-color);
    font-size: 13px;
    font-variant-numeric: tabular-nums;
}

.added-actions {
    display: flex;
    gap: 6px;
}

.empty-state {
    padding: 12px;
    text-align: center;
    color: var(--bs-secondary-color);
    background: var(--bs-tertiary-bg);
    border-radius: var(--radius-sm);
    font-size: 14px;
    font-style: italic;
}

@media (max-width: 575.98px) {
    .bulk-row {
        grid-template-columns: 1fr 64px 32px;
        grid-template-rows: auto auto;
        gap: 4px 6px;
    }

    .bulk-row .bulk-unit {
        grid-column: 1 / 4;
    }
}

@media (prefers-reduced-motion: reduce) {
    .mode-btn,
    .bulk-row,
    .bulk-remove,
    .added-item {
        transition: none;
    }
}
</style>