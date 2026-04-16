<script setup lang="ts">
definePageMeta({
    middleware: "auth-only",
});

import ExpiryDate from '~/models/ExpiryDate';
import Ingredient from '~/models/Ingredient';
import { useIngredientStore } from '~/stores/ingredients';

const store = useIngredientStore();

const {
    units,
    pushIngredient,
    postIngredient,
    loadAvailableIngredients,
    loadIngredients,
    removeIngredient,
    getMissing,
} = store;

const alert = ref(false);
const saving = ref(false);

const name = ref("")
const ingredientId = ref<number | null>(null)
const quantity = ref<number | null>(null)
const unit = ref("")
const expiry = ref("")
const dropdownOpen = ref(false)

const recent = computed(() =>
    [...store.ingredients].reverse().slice(0, 3)
)

const total = computed(() => store.ingredients.length)

const filtered = computed(() => {
    if (name.value === "") {
        return store.availableIngredients.slice(0, 10)
    }
    const results: { id: number; name: string }[] = []
    for (const item of store.availableIngredients) {
        if (item.name.toLowerCase().includes(name.value.toLowerCase())) {
            results.push(item)
        }
        if (results.length >= 10) break
    }
    return results
})

const isValid = computed(() => ingredientId.value !== null)

const missing = computed(async () => await getMissing())

function select(item: { id: number; name: string }) {
    ingredientId.value = item.id
    name.value = item.name
    dropdownOpen.value = false
}

function onBlur() {
    dropdownOpen.value = false
    if (!isValid.value) {
        name.value = ""
        ingredientId.value = null
    }
}

async function openDropdown() {
    dropdownOpen.value = true
    await nextTick()
    document.getElementById("ingredient-name")?.focus()
}

function reset() {
    name.value = ""
    ingredientId.value = null
    quantity.value = null
    unit.value = ""
    expiry.value = ""
}

async function save() {
    if (
        !isValid.value ||
        unit.value === "" ||
        expiry.value === "" ||
        quantity.value == null ||
        quantity.value <= 0
    ) {
        alert.value = true
        return
    }

    saving.value = true
    try {
        const exp = new ExpiryDate(new Date(expiry.value))
        const item = new Ingredient(
            ingredientId.value!,
            name.value,
            quantity.value,
            unit.value,
            exp
        )
        const res: any = await postIngredient(item)
        item.id = res.ingredient_id
        item.tag = exp.checkExpiry()
        pushIngredient(item)
        reset()
    } catch {
        alert.value = true
    } finally {
        saving.value = false
    }
}

const onDelete = async (ingredient: Ingredient) => {
    try {
        await removeIngredient(ingredient.id)
    } catch {
        alert.value = true
    }
}

function tagIcon(tag: string) {
    switch (tag) {
        case 'Friss': return 'bi bi-leaf'
        case 'Hamarosan': return 'bi bi-clock-history'
        default: return 'bi bi-exclamation-triangle'
    }
}

function tagClass(tag: string) {
    switch (tag) {
        case 'Friss': return 'badge-fresh'
        case 'Hamarosan': return 'badge-warning'
        default: return 'badge-expired'
    }
}

onMounted(async () => {
    try {
        
        const tasks: Promise<any>[] = [loadAvailableIngredients()]
        if (store.ingredients.length === 0) {
            tasks.push(loadIngredients())
        }
        await Promise.all(tasks)
    } catch {
        alert.value = true
    }
})
</script>

<template>
    <div class="page">
        <div class="layout">

            <section class="hero d-none d-lg-block mt-4 position-relative overflow-hidden sidebar">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSLN9jlsLxNa9URKbO2qra2TdszoSHF40m1iZ4-wleCqrlPDTZF5fly-No8zHGvm27CwIm1YPGnadC2OOTmr9t9eZt3Og_UePN1KtlkN1qIaCIw_2__B6Lcxfhc82McJfnVOU-hW6kPd4O5RW5TpBiDt8N6nAEG1T_5_KoVuOSVuWlh3vTKffb03SuuOmxPW02m7FZ26AfZTzyygW3geWL--ncrAyIr9Y-ZMRlySDQRkxhnmO-2QhU8wsrITA85nSBOKhc7os7X-Y"
                    alt="Friss zöldségek és hozzávalók"
                    class="position-absolute top-0 start-0 w-100 h-100 object-fit-cover" />
                <div class="hero-overlay position-absolute top-0 start-0 w-100 h-100"></div>
                <div class="hero-text position-absolute z-1">
                    <h1 class="hero-title text-uppercase">Töltsd fel<br>a kamrád</h1>
                    <p class="hero-sub m-0 fw-medium">Tartsd naprakészen a hozzávalóidat.</p>
                </div>
            </section>

            <section class="form-area d-flex flex-column align-items-center">
                <div class="form-inner w-100">
                    <header class="form-head">
                        <h2 class="form-title fw-bold">Új alapanyag</h2>
                        <p class="form-desc m-0 text-secondary">Add hozzá a legújabb alapanyagaidat a kamrádhoz.</p>
                    </header>

                    <form @submit.prevent="save" class="form d-flex flex-column">
                        <div class="field position-relative">
                            <label class="label d-block fw-bold text-uppercase">Alapanyag neve</label>
                            <div v-if="!dropdownOpen" class="input-wrap d-flex align-items-center"
                                @click="openDropdown">
                                <span :class="name ? 'input-value' : 'input-placeholder'">
                                    {{ name || 'Pl. Paradicsom' }}
                                </span>
                            </div>
                            <input v-else id="ingredient-name" v-model="name" type="text" class="field-input"
                                placeholder="Pl. Paradicsom" autocomplete="off" @blur="onBlur" />
                            <ul v-if="dropdownOpen && filtered.length" class="dropdown">
                                <li v-for="item in filtered" :key="item.id" @mousedown.prevent="select(item)">
                                    {{ item.name }}
                                </li>
                            </ul>
                        </div>

                        <div class="field-row">
                            <div class="field position-relative">
                                <label class="label d-block fw-bold text-uppercase">Lejárati dátum</label>
                                <input v-model="expiry" type="date" class="field-input" />
                            </div>
                            <div class="field position-relative">
                                <label class="label d-block fw-bold text-uppercase">Mennyiség és egység</label>
                                <div class="qty-group d-flex">
                                    <input v-model.number="quantity" type="number" class="field-input qty-input"
                                        placeholder="10" min="0" step="any" />
                                    <select v-model="unit" class="field-input unit-select">
                                        <option value="" disabled>Egység</option>
                                        <option v-for="u in units" :key="u" :value="u">{{ u }}</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="row flex justify-content-center grouped-buttons">
                            <Button icon="bi-arrow-bar-left" outline class="floating-button button-left w-auto col-auto align-self-center" to="./">
                                Vissza
                            </Button>
                            <Button icon="bi-plus-circle"
                                class="submit-btn col-9 border-0 text-white mt-0 position-relative overflow-hidden button-right align-self-center"
                                type="submit"
                                :disabled="saving">
                                <span>Hozzáadás</span>
                            </Button>

                        </div>

                    </form>
                </div>
            </section>

            <section class="recent mb-4">
                <div class="h-100">
                    <div class="recent-head d-flex justify-content-between align-items-center">
                        <h3 class="recent-title m-0 fw-bold text-uppercase">Legutóbbi hozzáadások</h3>
                        <span class="recent-count">{{ total }} db</span>
                        <NuxtLink to="/ingredients" class="recent-link text-decoration-none fw-bold">Összes megtekintése
                        </NuxtLink>
                    </div>

                    <TransitionGroup v-if="recent.length" name="recent-anim" tag="div"
                        class="recent-list d-flex flex-column">
                        <div v-for="item in recent" :key="item.id"
                            class="recent-card d-flex align-items-center justify-content-between">
                            <div class="recent-left d-flex align-items-center">
                                <div class="badge-icon d-flex align-items-center justify-content-center flex-shrink-0"
                                    :class="tagClass(item.tag)">
                                    <i :class="tagIcon(item.tag)"></i>
                                </div>
                                <div>
                                    <p class="recent-name m-0 fw-bold">{{ item.name }}</p>
                                    <p class="recent-meta m-0">{{ item.quantity }}{{ item.unit }} &bull; Lejár: {{
                                        item.expiry.toShort() }}</p>
                                </div>
                            </div>
                            <button
                                class="remove-btn border-0 bg-transparent d-flex align-items-center justify-content-center flex-shrink-0 rounded-circle"
                                @click="onDelete(item as Ingredient)" title="Törlés">
                                <i class="bi bi-x"></i>
                            </button>
                        </div>
                    </TransitionGroup>

                    <div v-else class="recent-empty">
                        <p class="m-0 text-center text-secondary">Még nincs hozzáadott alapanyag.</p>
                    </div>
                </div>
            </section>

            <section class="cta">
                <NuxtLink to="/recipes"
                    class="cta-card d-flex align-items-center justify-content-between text-decoration-none overflow-hidden position-relative">

                    <div class="position-relative z-1">
                        <p class="cta-label fw-bold">Befejezted a feltöltést?</p>
                        <h3 class="cta-title m-0">Böngéssz recepteket az alapanyagaidhoz</h3>
                    </div>
                    <div
                        class="cta-arrow d-flex align-items-center justify-content-center flex-shrink-0 rounded-circle text-white position-relative z-1">
                        <i class="bi bi-arrow-right"></i>
                    </div>
                </NuxtLink>
            </section>

        </div>
    </div>

    <Alert message="Helytelen adat." :show="alert" type="error" @close="alert = false" />
</template>

<style scoped>
@import '~/assets/css/ingredientAdd.css';
</style>
