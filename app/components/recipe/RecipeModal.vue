<script setup lang="ts">
import { computed, ref, onMounted, watch } from "vue";
import { useRecipeModal } from "~/composables/useRecipeModal";

const recipeModal = useRecipeModal();
const { t } = useI18n();
const closeBtn = ref<HTMLButtonElement | null>(null);

const steps = computed(() => [
    { id: 1, title: t('recipe.addRecipeModal.steps.description') },
    { id: 2, title: t('recipe.addRecipeModal.steps.type') },
    { id: 3, title: t('recipe.addRecipeModal.steps.ingredients') },
    { id: 4, title: t('recipe.addRecipeModal.steps.instructions') }
]);

onMounted(() => {
    recipeModal.init();
    recipeModal.closeButton = closeBtn.value;
});

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
                                {{ recipeModal.isEditMode ? $t('recipe.addRecipeModal.editTitle') : $t('recipe.addRecipeModal.title') }}
                            </h2>
                            <p>{{ recipeModal.isEditMode ? $t('recipe.addRecipeModal.editSubtitle') : $t('recipe.addRecipeModal.subtitle') }}</p>
                        </div>

                        <div class="recipe-progress-meta text-end">
                            <p>{{ $t('recipe.addRecipeModal.stepCount', { current: currentStep, total: steps.length }) }}</p>
                            <div class="recipe-progress">
                                <span class="recipe-progress-bar d-block" :style="{ width: progress }"></span>
                            </div>
                        </div>
                    </div>

                    <button ref="closeBtn" type="button" class="btn-close ms-3" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>

                <div class="modal-body p-0">
                    <div class="container-fluid">
                        <div class="row g-0 recipe-layout">
                            <div class="col-lg-6 col-md-5 col-sm-12 recipe-sidebar-wrap">
                                <aside class="recipe-sidebar h-100">
                                    <div class="recipe-card">
                                        <div v-for="(step, index) in steps"
                                            class="step-btn text-start position-relative"
                                            :class="{ active: currentStep === step.id }" @click="goToStep(step.id)">
                                            <span class="step-index">{{ step.id }}</span>

                                            <span class="step-text">
                                                <span class="fw-semibold d-block">{{ step.title }}</span>
                                                <small class="text-muted">{{ $t('recipe.addRecipeModal.stepLabel', { step: step.id }) }}</small>
                                            </span>

                                            <span v-if="index < steps.length - 1" class="step-line"></span>
                                        </div>
                                    </div>

                                    <div class="recipe-card recipe-summary-card mt-4">
                                        <div class="summary-row">
                                            <span>{{ $t('recipe.addRecipeModal.summary.name') }}</span>
                                            <strong>{{ recipeModal.recipe.name || $t('recipe.addRecipeModal.summary.empty') }}</strong>
                                        </div>

                                        <div class="summary-row">
                                            <span>{{ $t('recipe.addRecipeModal.summary.meal') }}</span>
                                            <strong>{{ recipeModal.selectedMealType ? $t('categories.' + recipeModal.selectedMealType.id) : $t('recipe.addRecipeModal.summary.empty') }}</strong>
                                        </div>

                                        <div class="summary-row">
                                            <span>{{ $t('recipe.addRecipeModal.summary.ingredient') }}</span>
                                            <strong>{{ $t('recipe.addRecipeModal.summary.count', { n: recipeModal.recipe.ingredients.length }) }}</strong>
                                        </div>

                                        <div class="summary-row">
                                            <span>{{ $t('recipe.addRecipeModal.summary.step') }}</span>
                                            <strong>{{ $t('recipe.addRecipeModal.summary.count', { n: recipeModal.recipe.instructions.length }) }}</strong>
                                        </div>
                                    </div>
                                </aside>
                            </div>

                            <div class="col-lg-6 col-md-7">
                                <div class="recipe-content">
                                    <div v-if="currentStep === 1" class="recipe-card recipe-panel d-flex flex-column gap-4">
                                        <div>
                                            <label class="form-label">{{ $t('recipe.addRecipeModal.form.name') }}</label>
                                            <input v-model="recipeModal.recipe.name" type="text" class="form-control"
                                                :placeholder="$t('recipe.addRecipeModal.form.namePlaceholder')">
                                        </div>

                                        <div>
                                            <label class="form-label">{{ $t('recipe.addRecipeModal.form.description') }}</label>
                                            <textarea v-model="recipeModal.recipe.description" rows="5" class="form-control"
                                                :placeholder="$t('recipe.addRecipeModal.form.descriptionPlaceholder')"></textarea>
                                        </div>

                                        <div class="row g-3">
                                            <div class="col-md-6">
                                                <label class="form-label">{{ $t('recipe.addRecipeModal.form.prepTime') }}</label>
                                                <input v-model="recipeModal.recipe.prepTime" type="number" min="1" class="form-control">
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label">{{ $t('recipe.addRecipeModal.form.servings') }}</label>
                                                <input v-model="recipeModal.recipe.servings" type="number" min="1" class="form-control">
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
                                                    {{ $t('categories.' + meal.id) }}
                                                </Button>
                                            </div>
                                        </div>
                                        <div>
                                            <label class="form-label d-block">{{ $t('recipe.addRecipeModal.form.type') }}</label>
                                            <div class="d-flex flex-wrap gap-2">
                                                <Button v-for="tag in recipeModal.tags" type="button" class="rounded-pill recipe-pill"
                                                    :color="recipeModal.recipe.tags.includes(tag.id) ? 'yellow' : undefined"
                                                    @click="recipeModal.toggleTag(tag.id)">
                                                    {{ $t('categories.' + tag.id) }}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div v-else-if="currentStep === 3" class="recipe-card recipe-panel d-flex flex-column gap-4">
                                        <div class="row g-3">
                                            <div class="col-12">
                                                <label class="form-label">{{ $t('recipe.addRecipeModal.form.ingredient') }}</label>
                                                <input v-model="recipeModal.ingredientSearch" type="text" class="form-control"
                                                    :placeholder="$t('recipe.addRecipeModal.form.ingredientPlaceholder')"
                                                    @focus="recipeModal.onIngredientSearchFocus"
                                                    @input="recipeModal.onIngredientSearchInput">
                                            </div>

                                            <div class="col-lg-6">
                                                <label class="form-label">{{ $t('recipe.addRecipeModal.form.quantity') }}</label>
                                                <input v-model="recipeModal.selectedIngredientQuantity" type="number" min="1" class="form-control">
                                            </div>
                                            <div class="col-lg-6">
                                                <label class="form-label">{{ $t('recipe.addRecipeModal.form.unit') }}</label>
                                                <select v-model="recipeModal.selectedIngredientUnit" class="form-select">
                                                    <option v-for="unit in recipeModal.availableUnits" :value="unit">{{ unit }}</option>
                                                </select>
                                            </div>
                                            <div class="col-12">
                                                <div v-if="recipeModal.showIngredientResults" class="ingredient-search-results d-flex flex-wrap gap-2 mt-2">
                                                    <Button v-for="ingredient in recipeModal.filteredIngredients" type="button"
                                                        class="rounded-pill recipe-pill ingredient-result-pill" @click="recipeModal.selectIngredient(ingredient.id, ingredient.name)">
                                                        {{ ingredient.name }}
                                                    </Button>
                                                    <div v-if="recipeModal.filteredIngredients.length === 0" class="ingredient-search-empty">
                                                        {{ $t('recipe.addRecipeModal.form.noResults') }}
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-md-12 d-flex align-items-end gap-2">
                                                <Button v-if="recipeModal.hasSelectedIngredient" type="button" color="green" class="recipe-action-btn w-100" @click="recipeModal.addOrUpdateIngredient">
                                                    {{ recipeModal.isEditingIngredient ? $t('recipe.addRecipeModal.form.saveEdit') : $t('recipe.addRecipeModal.form.add') }}
                                                </Button>
                                                <Button v-if="recipeModal.isEditingIngredient" type="button" outline class="w-100" @click="recipeModal.cancelIngredientEdit">
                                                    {{ $t('recipe.addRecipeModal.form.cancel') }}
                                                </Button>
                                            </div>
                                        </div>

                                        <div class="ingredient-list d-flex flex-column gap-2">
                                            <div v-if="!recipeModal.isEditingIngredient" class="ingredient-list d-flex flex-column gap-2">
                                                <div v-if="recipeModal.recipe.ingredients.length === 0" class="empty-state">
                                                    {{ $t('recipe.addRecipeModal.form.noIngredients') }}
                                                </div>
                                                <div v-for="(ingredient, index) in recipeModal.recipe.ingredients"
                                                    class="ingredient-item d-flex align-items-center justify-content-between gap-3">
                                                    <span>{{ ingredient.name }} - {{ ingredient.quantity }} {{ ingredient.unit }}</span>
                                                    <div class="d-flex gap-2">
                                                        <Button type="button" color="yellow" icon="bi bi-pencil-square" icon-only
                                                            @click="recipeModal.editIngredient(index)"></Button>
                                                        <Button type="button" color="orange" icon="bi bi-trash" icon-only
                                                            @click="recipeModal.removeIngredient(index)"></Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div v-else-if="currentStep === 4" class="recipe-card recipe-panel d-flex flex-column gap-4">
                                        <div class="row g-2">
                                            <div class="col-12 col-md">
                                                <input v-model="recipeModal.instructionInput" type="text" class="form-control h-100"
                                                    :placeholder="$t('recipe.addRecipeModal.form.instructionPlaceholder')">
                                            </div>

                                            <div class="col-12 col-md-auto">
                                                <Button type="button" color="green" class="w-100" @click="recipeModal.addOrUpdateInstruction">
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

                                    <div v-if="recipeModal.errorMessage" class="alert alert-danger mt-4 mb-0">
                                        {{ recipeModal.errorMessage }}
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

                    <Button v-else type="button" color="green" :disabled="!recipeModal.canSubmit || recipeModal.isSaving" @click="recipeModal.saveRecipe">
                        {{ recipeModal.isSaving ? $t('recipe.addRecipeModal.footer.saving') : (recipeModal.isEditMode ? $t('recipe.addRecipeModal.footer.update') : $t('recipe.addRecipeModal.footer.save')) }}
                    </Button>
                </div>
            </div>
        </div>
    </div>
    </ClientOnly>
</template>
<style scoped src="@/assets/css/recipeModal.css">
.recipe-modal-header,
.recipe-sidebar,
.recipe-content,
.modal-footer,
.recipe-dialog {
    padding: 30px;
}

.ingredient-search-results {
    width: 100%;
}

.ingredient-result-pill {
    white-space: nowrap;
}
</style>