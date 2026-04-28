<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue";
import { useIngredientStore } from "~/stores/ingredients";
import type Ingredient from "~/models/Ingredient";

definePageMeta({ middleware: "auth-only" });

const store = useIngredientStore();

const addModalRef = ref<any>(null);
const missingModalRef = ref<any>(null);

const search = ref("");
const activeTab = ref<"all" | "fresh" | "soon" | "expired">("all");

const highlightedId = ref<number | null>(null);
const rowContainers = ref<Record<number, HTMLElement | null>>({});

const loading = ref(false);
const errorAlert = ref(false);

const freshCount = computed(() => store.ingredients.filter((i) => i.tag === "fresh").length);
const warningCount = computed(() => store.ingredients.filter((i) => i.tag === "soon").length);
const expiredCount = computed(() => store.ingredients.filter((i) => i.tag === "expired").length);

const filtered = computed(() => {
    const q = search.value.trim().toLowerCase();
    return store.ingredients.filter((i) => {
        if (activeTab.value !== "all" && i.tag !== activeTab.value) return false;
        if (q && !i.name.toLowerCase().includes(q)) return false;
        return true;
    });
});

const openAddModal = (prefillName?: string) => addModalRef.value?.open(prefillName);
const openMissing = () => missingModalRef.value?.open();

const handleMissingPick = (name: string) => {
    activeTab.value = "all";
    openAddModal(name);
};

const handleJump = async (id: number) => {
    activeTab.value = "all";
    search.value = "";
    highlightedId.value = id;
    await nextTick();
    rowContainers.value[id]?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => {
        if (highlightedId.value === id) highlightedId.value = null;
    }, 1300);
};

const handleDelete = async (ingredient: Ingredient) => {
    try {
        await store.removeIngredient(ingredient.id);
    } catch {
        errorAlert.value = true;
    }
};

const handleEdit = (ingredient: Ingredient) => {
    addModalRef.value?.openForEdit(ingredient);
};

onMounted(async () => {
    const tasks: Promise<unknown>[] = [];
    if (!store.ingredients.length) tasks.push(store.loadIngredients());
    if (!store.availableIngredients.length) tasks.push(store.loadAvailableIngredients());
    if (!tasks.length) return;

    loading.value = true;
    try {
        await Promise.all(tasks);
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <section class="ingredients-page">
        <div class="ingredients-shell mx-auto px-3 px-md-4 px-lg-5 py-4">
            <header class="page-header mb-4">
                <h1 class="page-title mb-2">{{$t('pantry.page.title')}}</h1>
                <p class="page-subtitle mb-0">
                    {{ $t('pantry.page.subtitle') }}
                </p>
            </header>

            <div class="row g-4">
                <aside class="col-12 col-lg-4 order-lg-1 order-2">
                    <IngredientSidebar @jump="handleJump" @open-missing="openMissing" />
                </aside>

                <section class="col-12 col-lg-8 order-lg-2 order-1">
                    <div class="row align-items-center mb-3 gy-2">
                        <div class="col-12">
                            <SearchBar v-model="search" :placeholder="$t('pantry.list.searchPlaceholder')" class="w-100" />
                        </div>
                    </div>

                    <nav class="tabs mb-3">
                        <button
                            type="button"
                            class="tab"
                            :class="{ active: activeTab === 'all' }"
                            @click="activeTab = 'all'"
                        >
                            {{ $t('pantry.statCards.filters.all') }}
                            <span class="tab-count">{{ store.ingredients.length }}</span>
                        </button>
                        <button
                            type="button"
                            class="tab"
                            :class="{ active: activeTab === 'fresh' }"
                            @click="activeTab = 'fresh'"
                        >
                            {{ $t('pantry.statCards.filters.fresh') }}
                            <span class="tab-count">{{ freshCount }}</span>
                        </button>
                        <button
                            type="button"
                            class="tab"
                            :class="{ active: activeTab === 'soon' }"
                            @click="activeTab = 'soon'"
                        >
                            {{ $t('pantry.statCards.filters.soon') }}
                            <span class="tab-count">{{ warningCount }}</span>
                        </button>
                        <button
                            type="button"
                            class="tab"
                            :class="{ active: activeTab === 'expired' }"
                            @click="activeTab = 'expired'"
                        >
                            {{ $t('pantry.statCards.filters.expired') }}
                            <span class="tab-count">{{ expiredCount }}</span>
                        </button>
                    </nav>

                    <div class="list-area">
                        <button
                            type="button"
                            class="add-tile"
                            @click="openAddModal()"
                        >
                            <span class="plus">+</span>
                            <span>{{$t('pantry.list.addIngredient')}}</span>
                        </button>

                        <p v-if="loading" class="loading-note text-muted small mb-0 py-2 text-center">
                            {{$t('common.loading')}}
                        </p>

                        <div v-else-if="!filtered.length" class="empty-list">
                            <i class="bi bi-basket2 fs-2 mb-2 d-block"></i>
                            <p class="mb-0">
                                <template v-if="search">{{ $t('pantry.list.empty.noResults') }}</template>
                                <template v-else-if="activeTab === 'all'">{{ $t('pantry.list.empty.noIngredients') }}</template>
                                <template v-else>{{ $t('pantry.list.empty.noStatus') }}</template>
                            </p>
                        </div>

                        <div v-else class="rows">
                            <div
                                v-for="ingredient in filtered"
                                :key="ingredient.id"
                                :ref="(el) => (rowContainers[ingredient.id] = el as HTMLElement)"
                            >
                                <IngredientRow
                                    :ingredient="ingredient as Ingredient"
                                    :highlight="highlightedId === ingredient.id"
                                    @delete="handleDelete"
                                    @edit="handleEdit"
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>

        <IngredientAddModal ref="addModalRef" />
        <IngredientMissingSuggestionsModal ref="missingModalRef" @pick="handleMissingPick" />

        <Alert :message="$t('common.errors.invalidData')" :show="errorAlert" type="error" @close="errorAlert = false" />
    </section>
</template>

<style scoped>
.ingredients-page {
    min-height: 100%;
    background: var(--bs-body-bg);
}

.ingredients-shell {
    width: min(100%, 1320px);
}

.page-title {
    font-family: "Caveat Brush", cursive;
    font-size: clamp(2rem, 4vw, 2.8rem);
    text-transform: uppercase;
    color: var(--bs-emphasis-color);
}

.page-subtitle {
    color: var(--bs-secondary-color);
    max-width: 60ch;
}

.tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 1.25rem;
    border-bottom: 1px solid var(--bs-border-color);
}

.tab {
    background: none;
    border: none;
    padding: 0.5rem 0;
    font-weight: 500;
    color: var(--bs-secondary-color);
    cursor: pointer;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
}

.tab:hover {
    color: var(--bs-emphasis-color);
}

.tab.active {
    color: var(--bs-emphasis-color);
    border-bottom-color: var(--orange);
    font-weight: 600;
}

.tab-count {
    font-size: 11px;
    padding: 1px 6px;
    border-radius: var(--radius-rounded);
    background: var(--bs-tertiary-bg);
    color: var(--bs-secondary-color);
}

.list-area {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.rows {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}

.add-tile {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    padding: 0.85rem 1rem;
    border: 2px dashed var(--bs-border-color);
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--bs-secondary-color);
    cursor: pointer;
    font-weight: 500;
    transition: all 0.15s ease-in;
}

.add-tile:hover {
    border-color: var(--orange);
    color: var(--orange);
    background: var(--accent-soft);
}

[data-bs-theme="dark"] .add-tile:hover {
    background: rgba(255, 114, 49, 0.08);
}

.add-tile .plus {
    font-size: 22px;
    font-weight: 300;
    line-height: 1;
}

.empty-list {
    text-align: center;
    padding: 2.5rem 1rem;
    color: var(--bs-secondary-color);
}

@media (max-width: 991px) {
    .page-subtitle {
        font-size: var(--small-text);
    }
}

@media (max-width: 576px) {
    .tabs {
        gap: 0.85rem;
    }
}
</style>
