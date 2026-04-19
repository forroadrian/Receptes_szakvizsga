<script setup lang="ts">
import { computed, ref } from "vue";
import { useRecipeModal } from "~/composables/useRecipeModal";

const recipeModal = useRecipeModal();

const steps = [
    { id: 1, title: "Recept leírása" },
    { id: 2, title: "Recept típusa" },
    { id: 3, title: "Hozzávalók" },
    { id: 4, title: "Elkészítési lépések" }
];

const currentStep = ref(1);

const progress = computed(() => `${(currentStep.value / steps.length) * 100}%`);
const canGoBack = computed(() => currentStep.value > 1);
const canGoNext = computed(() => currentStep.value < steps.length);

function nextStep() {
    if (canGoNext.value) currentStep.value++;
}

function prevStep() {
    if (canGoBack.value) currentStep.value--;
}

function goToStep(id: number) {
    currentStep.value = id;
}
</script>

<template>
    <ClientOnly>
    <div id="openAddRecipeModal" class="modal fade" tabindex="-1" aria-labelledby="openAddRecipeModalLabel"
        aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-xl recipe-dialog">
            <div class="modal-content recipe-modal">
                <div class="modal-header recipe-modal-header">
                    <div class="w-100 d-flex align-items-start justify-content-between gap-3 flex-wrap">
                        <div>
                            <h2 id="openAddRecipeModalLabel" class="modal-title fs-3 mb-1">Recept létrehozása</h2>
                            <p>Add meg a recept adatait lépésről lépésre.</p>
                        </div>

                        <div class="recipe-progress-meta text-end">
                            <p>{{ currentStep }} / {{ steps.length }} lépés</p>
                            <div class="recipe-progress">
                                <span class="recipe-progress-bar d-block" :style="{ width: progress }"></span>
                            </div>
                        </div>
                    </div>

                    <button ref="recipeModal.closeButton" type="button" class="btn-close ms-3"
                        data-bs-dismiss="modal" aria-label="Close">
                    </button>
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
                                                <small class="text-muted">Lépés {{ step.id }}</small>
                                            </span>

                                            <span v-if="index < steps.length - 1" class="step-line"></span>
                                        </div>
                                    </div>

                                    <div class="recipe-card recipe-summary-card mt-4">
                                        <div class="summary-row">
                                            <span>Név</span>
                                            <strong>{{ recipeModal.recipe.name || "—" }}</strong>
                                        </div>

                                        <div class="summary-row">
                                            <span>Étkezés</span>
                                            <strong>{{ recipeModal.selectedMealType?.name || "—" }}</strong>
                                        </div>

                                        <div class="summary-row">
                                            <span>Alapanyag</span>
                                            <strong>{{ recipeModal.recipe.ingredients.length }} db</strong>
                                        </div>

                                        <div class="summary-row">
                                            <span>Lépés</span>
                                            <strong>{{ recipeModal.recipe.instructions.length }} db</strong>
                                        </div>
                                    </div>
                                </aside>
                            </div>

                            <div class="col-lg-6 col-md-7">
                                <div class="recipe-content">
                                    <div v-if="currentStep === 1"
                                        class="recipe-card recipe-panel d-flex flex-column gap-4">
                                        <div>
                                            <label class="form-label">Recept neve</label>
                                            <input v-model="recipeModal.recipe.name" type="text"
                                                class="form-control" placeholder="Pl. Palacsinta">
                                        </div>

                                        <div>
                                            <label class="form-label">Recept leírása</label>
                                            <textarea v-model="recipeModal.recipe.description" rows="5"
                                                class="form-control" placeholder="Rövid leírás"></textarea>
                                        </div>

                                        <div class="row g-3">
                                            <div class="col-md-6">
                                                <label class="form-label">Elkészítési idő (perc)</label>
                                                <input v-model="recipeModal.recipe.prepTime" type="number" min="1"
                                                    class="form-control">
                                            </div>

                                            <div class="col-md-6">
                                                <label class="form-label">Adag</label>
                                                <input v-model="recipeModal.recipe.servings" type="number" min="1"
                                                    class="form-control">
                                            </div>
                                        </div>
                                    </div>

                                    <div v-else-if="currentStep === 2"
                                        class="recipe-card recipe-panel d-flex flex-column gap-4">
                                        <div>
                                            <label class="form-label d-block">Étkezés</label>
                                            <div class="d-flex flex-wrap gap-2">
                                                <Button v-for="meal in recipeModal.mealTypes" type="button" class="rounded-pill recipe-pill"
                                                    :color="recipeModal.recipe.mealType === meal.id ? 'yellow' : undefined"
                                                    @click="recipeModal.recipe.mealType = meal.id">
                                                    {{ meal.name }}
                                                </Button>
                                            </div>
                                        </div>
                                        <div>
                                            <label class="form-label d-block">Típus</label>
                                            <div class="d-flex flex-wrap gap-2">
                                                <Button v-for="tag in recipeModal.tags" type="button"
                                                    class="rounded-pill recipe-pill"
                                                    :color="recipeModal.recipe.tags.includes(tag.id) ? 'yellow' : undefined"
                                                    @click="recipeModal.toggleTag(tag.id)">
                                                    {{ tag.name }}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div v-else-if="currentStep === 3"
                                        class="recipe-card recipe-panel d-flex flex-column gap-4">
                                        <div class="row g-3">
                                            <div class="col-12">
                                                <label class="form-label">Hozzávaló</label>
                                                <input v-model="recipeModal.ingredientSearch" type="text"
                                                    class="form-control" placeholder="Termék név..."
                                                    @focus="recipeModal.onIngredientSearchFocus"
                                                    @input="recipeModal.onIngredientSearchInput">
                                            </div>

                                            <div class="col-lg-6">
                                                <label class="form-label">Mennyiség</label>
                                                <input v-model="recipeModal.selectedIngredientQuantity"
                                                    type="number" min="1" class="form-control">
                                            </div>

                                            <div class="col-lg-6">
                                                <label class="form-label">Egység</label>
                                                <select v-model="recipeModal.selectedIngredientUnit"
                                                    class="form-select">
                                                    <option v-for="unit in recipeModal.availableUnits"
                                                        :value="unit">
                                                        {{ unit }}
                                                    </option>
                                                </select>
                                            </div>
                                            <div class="col-12">
                                                <div v-if="recipeModal.showIngredientResults"
                                                    class="ingredient-search-results d-flex flex-wrap gap-2 mt-2">
                                                    <Button v-for="ingredient in recipeModal.filteredIngredients" type="button"
                                                        class="rounded-pill recipe-pill ingredient-result-pill"
                                                        @click="recipeModal.selectIngredient(ingredient.id, ingredient.name)">
                                                        {{ ingredient.name }}
                                                    </Button>

                                                    <div v-if="recipeModal.filteredIngredients.length === 0"
                                                        class="ingredient-search-empty">
                                                        Nincs találat.
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-md-12 d-flex align-items-end">
                                                <Button type="button" color="green" class="recipe-action-btn w-100"
                                                    :disabled="!recipeModal.hasSelectedIngredient"
                                                    @click="recipeModal.addIngredient">
                                                    Hozzáadás
                                                </Button>
                                            </div>
                                        </div>

                                        <div class="ingredient-list d-flex flex-column gap-2">
                                            <div v-if="recipeModal.recipe.ingredients.length === 0"
                                                class="empty-state">
                                                Még nincs hozzáadott hozzávaló.
                                            </div>

                                            <div v-for="(ingredient, index) in recipeModal.recipe.ingredients"
                                                class="ingredient-item d-flex align-items-center justify-content-between gap-3">
                                                <span>{{ ingredient.name }} - {{ ingredient.quantity }} {{ingredient.unit }}</span>

                                                <Button type="button" color="orange" size="sm"
                                                    @click="recipeModal.removeIngredient(index)">
                                                    Törlés
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div v-else-if="currentStep === 4"
                                        class="recipe-card recipe-panel d-flex flex-column gap-4">
                                        <div class="row g-2">
                                            <div class="col-12 col-md">
                                                <input v-model="recipeModal.instructionInput" type="text"
                                                    class="form-control h-100"
                                                    placeholder="Pl. Keverd össze az alapanyagokat">
                                            </div>

                                            <div class="col-12 col-md-auto">
                                                <Button type="button" color="green" class="w-100"
                                                    @click="recipeModal.addInstruction">
                                                    Hozzáadás
                                                </Button>
                                            </div>
                                        </div>

                                        <div class="instruction-list d-flex flex-column gap-2">
                                            <div v-if="recipeModal.recipe.instructions.length === 0"
                                                class="empty-state">
                                                Még nincs hozzáadott elkészítési lépés.
                                            </div>

                                            <div v-for="(instruction, index) in recipeModal.recipe.instructions"
                                                class="instruction-item d-flex align-items-center justify-content-between gap-3">
                                                <div class="d-flex align-items-center gap-3">
                                                    <strong>{{ index + 1 }}.</strong>
                                                    <span>{{ instruction }}</span>
                                                </div>

                                                <Button type="button" color="orange" size="sm"
                                                    @click="recipeModal.removeInstruction(index)">
                                                    Törlés
                                                </Button>
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
                    <Button type="button" class="btn-outline-secondary":disabled="!canGoBack || recipeModal.isSaving" @click="prevStep">
                        Vissza
                    </Button>

                    <Button v-if="canGoNext" type="button" color="yellow" :disabled="recipeModal.isSaving" @click="nextStep">
                        Tovább
                    </Button>

                    <Button v-else type="button" color="green" :disabled="!recipeModal.canSubmit || recipeModal.isSaving" 
                    @click="recipeModal.saveRecipe">
                        {{ recipeModal.isSaving ? "Mentés..." : "Mentés" }}
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