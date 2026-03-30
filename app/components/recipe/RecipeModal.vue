<script setup>
import { computed, ref } from 'vue'

const steps = [
    { id: 1, title: 'Recept leírása' },
    { id: 2, title: 'Recept típusa' },
    { id: 3, title: 'Hozzávalók' },
    { id: 4, title: 'Elkészítési lépések' }
]

const mealTypes = ['Reggeli', 'Ebéd', 'Vacsora', 'Snack'];
const tags = ['Gyors', 'Időigényes', 'Csípős', 'Sós', 'Főétel', 'Előétel', 'Desszert'];

const currentStep = ref(1);
const ingredientInput = ref('');
const instructionInput = ref('');

const recipe = ref({
    name: '',
    description: '',
    prepTime: 60,
    servings: 1,
    mealType: 'Reggeli',
    tags: [],
    ingredients: [],
    instructions: []
})

const progress = computed(() => `${(currentStep.value / steps.length) * 100}%`);
const canGoBack = computed(() => currentStep.value > 1);
const canGoNext = computed(() => currentStep.value < steps.length);

function nextStep() {
    if (canGoNext.value) currentStep.value++;
}

function prevStep() {
    if (canGoBack.value) currentStep.value--;
}

function goToStep(id) {
    currentStep.value = id;
}

</script>

<template>
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

                    <button type="button" class="btn-close ms-3" data-bs-dismiss="modal" aria-label="Close"></button>
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
                                            <strong>{{ recipe.name || '—' }}</strong>
                                        </div>

                                        <div class="summary-row">
                                            <span>Étkezés</span>
                                            <strong>{{ recipe.mealType }}</strong>
                                        </div>

                                        <div class="summary-row">
                                            <span>Alapanyag</span>
                                            <strong>{{ recipe.ingredients.length }} db</strong>
                                        </div>

                                        <div class="summary-row">
                                            <span>Lépés</span>
                                            <strong>{{ recipe.instructions.length }} db</strong>
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
                                            <input v-model="recipe.name" type="text" class="form-control"
                                                placeholder="Pl. Palacsinta">
                                        </div>

                                        <div>
                                            <label class="form-label">Recept leírása</label>
                                            <textarea v-model="recipe.description" rows="5" class="form-control"
                                                placeholder="Rövid leírás"></textarea>
                                        </div>

                                        <div class="row g-3">
                                            <div class="col-md-6">
                                                <label class="form-label">Elkészítési idő (perc)</label>
                                                <input v-model="recipe.prepTime" type="number" min="1"
                                                    class="form-control">
                                            </div>

                                            <div class="col-md-6">
                                                <label class="form-label">Adag</label>
                                                <input v-model="recipe.servings" type="number" min="1"
                                                    class="form-control">
                                            </div>
                                        </div>
                                    </div>

                                    <div v-else-if="currentStep === 2"
                                        class="recipe-card recipe-panel d-flex flex-column gap-4">
                                        <div>
                                            <label class="form-label d-block">Étkezés</label>
                                            <div class="d-flex flex-wrap gap-2">
                                                <button v-for="meal in mealTypes" type="button"
                                                    class="btn rounded-pill recipe-pill"
                                                    :class="recipe.mealType === meal ? 'grad dark border-0' : 'btn-outline-secondary'">
                                                    {{ meal }}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label class="form-label d-block">Típus</label>
                                            <div class="d-flex flex-wrap gap-2">
                                                <button v-for="tag in tags" type="button"
                                                    class="btn rounded-pill recipe-pill"
                                                    :class="recipe.tags.includes(tag) ? 'grad dark border-0' : 'btn-outline-secondary'">
                                                    {{ tag }}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div v-else-if="currentStep === 3"
                                        class="recipe-card recipe-panel d-flex flex-column gap-4">
                                        <div class="row g-2">
                                            <div class="col-12 col-md">
                                                <input v-model="ingredientInput" type="text" class="form-control h-100"
                                                    placeholder="Pl. 2 db tojás">
                                            </div>

                                            <div class="col-12 col-md-auto">
                                                <button type="button" class="btn grad dark recipe-action-btn w-100">
                                                    Hozzáadás
                                                </button>
                                            </div>
                                        </div>

                                        <div class="recipe-card recipe-block">
                                            <label class="form-label">Hozzáadott alapanyagok</label>

                                            <div v-if="recipe.ingredients.length" class="d-flex flex-wrap gap-2">
                                                <span v-for="(item, i) in recipe.ingredients"
                                                    class="badge rounded-pill px-3 py-2 recipe-chip">
                                                    {{ item }}
                                                    <button type="button" class="chip-btn ms-2">
                                                        ×
                                                    </button>
                                                </span>
                                            </div>
                                            <p v-else>Még nincs hozzáadott alapanyag.</p>
                                        </div>
                                    </div>

                                    <div v-else class="recipe-card recipe-panel d-flex flex-column gap-4">
                                        <div>
                                            <label class="form-label">Új lépés hozzáadása</label>
                                            <textarea v-model="instructionInput" rows="4" class="form-control"
                                                placeholder="Írd le az elkészítési lépést..."></textarea>
                                        </div>

                                        <div>
                                            <button type="button" class="btn grad dark recipe-action-btn">
                                                Lépés hozzáadása
                                            </button>
                                        </div>

                                        <div v-if="recipe.instructions.length" class="d-flex flex-column gap-3">
                                            <div v-for="(item) in recipe.instructions" class="recipe-instruction-item">
                                                <div class="recipe-instruction-index">{{ i + 1 }}</div>
                                                <div class="recipe-instruction-text">{{ item }}</div>

                                                <button type="button" class="btn text-danger text-decoration-none p-0">
                                                    Törlés
                                                </button>
                                            </div>
                                        </div>

                                        <p v-else class="text-muted mb-0">Még nincs hozzáadott elkészítési lépés.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button v-if="canGoBack" type="button" class="btn" @click="prevStep">
                        Vissza
                    </button>
                    <button v-if="canGoNext" type="button" class="btn grad green" @click="nextStep">
                        Következő
                    </button>
                    <button v-else type="button" class="btn grad orange" data-bs-dismiss="modal">
                        Mentés
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped src="@/assets/css/recipeModal.css">
.recipe-modal-header,
.recipe-sidebar,
.recipe-content,
.modal-footer,
.recipe-dialog {
    padding: 30px;
}
</style>