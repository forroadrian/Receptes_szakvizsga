<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useMenuStore } from "~/stores/menu";
import { useRecipeStore, type RecipeItem } from "~/stores/recipe";

const menuStore = useMenuStore();
const recipeStore = useRecipeStore();
const user = useSupabaseUser();
const { t, locale } = useI18n();

const intlLocale = computed(() => (locale.value === "hu" ? "hu-HU" : "en-US"));

const modalElRef = ref<HTMLElement | null>(null);
let modalInstance: any = null;

const targetDate = ref<string>("");
const activeTab = ref<"own" | "public">("own");
const search = ref("");
const pinnedRecipeIds = ref<number[]>([]);
const mode = ref<"new" | "existing">("new");
const existingMenuId = ref<number | null>(null);
const menuName = ref("");
const isSaving = ref(false);
const errorMessage = ref("");

const targetDateLabel = computed(() => {
    if (!targetDate.value) return "";
    const [y, m, d] = targetDate.value.split("-").map(Number);
    const date = new Date(y!, (m ?? 1) - 1, d);
    const formatted = new Intl.DateTimeFormat(intlLocale.value, {
        month: "long",
        day: "numeric",
    }).format(date);
    const weekday = new Intl.DateTimeFormat(intlLocale.value, { weekday: "long" }).format(date);
    return `${formatted}, ${weekday.toLowerCase()}`;
});

const defaultMenuName = computed(() => {
    if (!targetDate.value) return t("menu.addModal.defaultFallback");
    const [y, m, d] = targetDate.value.split("-").map(Number);
    const date = new Date(y!, (m ?? 1) - 1, d);
    const weekday = new Intl.DateTimeFormat(intlLocale.value, { weekday: "long" }).format(date);
    return t("menu.addModal.defaultName", { weekday });
});

const existingMenusForDate = computed(() =>
    targetDate.value ? menuStore.getMenusForDate(targetDate.value) : []
);

const hasExistingMenus = computed(() => existingMenusForDate.value.length > 0);

const currentUserId = computed(() => user.value?.id ?? null);

const allRecipes = computed<RecipeItem[]>(() => recipeStore.getAllRecipes());

const ownRecipes = computed(() =>
    allRecipes.value.filter((r) => r.author_id === currentUserId.value)
);

const publicRecipes = computed(() =>
    allRecipes.value.filter(
        (r) => r.active && r.author_id !== currentUserId.value
    )
);

const filteredRecipes = computed(() => {
    const source = activeTab.value === "own" ? ownRecipes.value : publicRecipes.value;
    const q = search.value.trim().toLowerCase();
    if (!q) return source;
    return source.filter(
        (r) =>
            r.name.toLowerCase().includes(q) ||
            r.description.toLowerCase().includes(q)
    );
});

const pinnedRecipes = computed(() =>
    pinnedRecipeIds.value
        .map((id) => allRecipes.value.find((r) => r.id === id))
        .filter((r): r is RecipeItem => !!r)
);

const isPinned = (id: number) => pinnedRecipeIds.value.includes(id);

const togglePin = (recipeId: number) => {
    if (isPinned(recipeId)) {
        pinnedRecipeIds.value = pinnedRecipeIds.value.filter((id) => id !== recipeId);
    } else {
        pinnedRecipeIds.value.push(recipeId);
    }
};

const canSubmit = computed(() => {
    if (!pinnedRecipeIds.value.length) return false;
    if (mode.value === "new") return menuName.value.trim().length > 0;
    return existingMenuId.value !== null;
});

const resetState = (dateKey: string) => {
    targetDate.value = dateKey;
    activeTab.value = "own";
    search.value = "";
    pinnedRecipeIds.value = [];
    mode.value = hasExistingMenus.value ? "existing" : "new";
    existingMenuId.value = existingMenusForDate.value[0]?.id ?? null;
    menuName.value = defaultMenuName.value;
    isSaving.value = false;
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

const openFor = async (dateKey: string) => {
    if (!recipeStore.getAllRecipes().length) {
        await recipeStore.loadRecipes();
    }
    resetState(dateKey);
    ensureModalInstance()?.show();
};

const close = () => modalInstance?.hide();

const handleSave = async () => {
    if (!canSubmit.value || isSaving.value) return;
    isSaving.value = true;
    errorMessage.value = "";
    try {
        const isoDate = `${targetDate.value}T12:00:00+02:00`;
        if (mode.value === "new") {
            await menuStore.createMenu(isoDate, menuName.value.trim(), [...pinnedRecipeIds.value]);
        } else if (existingMenuId.value !== null) {
            for (const recipeId of pinnedRecipeIds.value) {
                await menuStore.addRecipeToMenu(existingMenuId.value, recipeId);
            }
        }
        close();
    } catch (err: any) {
        errorMessage.value =
            err?.data?.message ?? err?.message ?? t("menu.addModal.error");
    } finally {
        isSaving.value = false;
    }
};

onMounted(() => {
    ensureModalInstance();
});

watch(hasExistingMenus, (has) => {
    if (!has && mode.value === "existing") {
        mode.value = "new";
    }
});

defineExpose({ openFor });
</script>

<template>
    <div
        id="recipeAddModal"
        ref="modalElRef"
        class="modal fade"
        tabindex="-1"
            aria-labelledby="recipeAddModalLabel"
            aria-hidden="true"
        >
            <div class="modal-dialog modal-dialog-centered modal-lg recipe-add-dialog">
                <div class="modal-content recipe-add-modal">
                    <div class="modal-header">
                        <div class="d-flex flex-column">
                            <h2 id="recipeAddModalLabel" class="modal-title fs-4 mb-1">
                                {{ $t('menu.addModal.title') }}
                            </h2>
                            <p class="mb-0 text-muted small">{{ targetDateLabel }}</p>
                        </div>
                        <button
                            type="button"
                            class="btn-close ms-3"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                        ></button>
                    </div>

                    <div class="modal-body">
                        <div v-if="pinnedRecipes.length" class="pinned-bar">
                            <span class="pinned-label">{{ $t('menu.addModal.pinned') }}</span>
                            <span
                                v-for="recipe in pinnedRecipes"
                                :key="recipe.id"
                                class="pinned-chip"
                            >
                                {{ recipe.name }}
                                <button
                                    type="button"
                                    class="chip-remove"
                                    :aria-label="$t('menu.addModal.removeAria')"
                                    @click="togglePin(recipe.id)"
                                >
                                    <i class="bi bi-x"></i>
                                </button>
                            </span>
                        </div>

                        <div v-if="hasExistingMenus" class="mode-toggle mb-3">
                            <label class="mode-option" :class="{ active: mode === 'new' }">
                                <input v-model="mode" type="radio" value="new" class="visually-hidden" />
                                {{ $t('menu.addModal.modeNew') }}
                            </label>
                            <label class="mode-option" :class="{ active: mode === 'existing' }">
                                <input v-model="mode" type="radio" value="existing" class="visually-hidden" />
                                {{ $t('menu.addModal.modeExisting') }}
                            </label>
                        </div>

                        <div v-if="mode === 'new'" class="mb-3">
                            <label class="form-label small fw-semibold" for="newMenuName">
                                {{ $t('menu.addModal.menuName') }}
                            </label>
                            <input
                                id="newMenuName"
                                v-model="menuName"
                                type="text"
                                class="form-control"
                                :placeholder="defaultMenuName"
                            />
                        </div>

                        <div v-else class="mb-3">
                            <label class="form-label small fw-semibold" for="existingMenuSelect">
                                {{ $t('menu.addModal.chooseMenu') }}
                            </label>
                            <select
                                id="existingMenuSelect"
                                v-model="existingMenuId"
                                class="form-select"
                            >
                                <option
                                    v-for="menu in existingMenusForDate"
                                    :key="menu.id"
                                    :value="menu.id"
                                >
                                    {{ $t('menu.addModal.existingOption', { name: menu.name || $t('menu.untitled'), count: menu.recipes.length }) }}
                                </option>
                            </select>
                        </div>

                        <div class="tabs mb-3">
                            <button
                                type="button"
                                class="tab"
                                :class="{ active: activeTab === 'own' }"
                                @click="activeTab = 'own'"
                            >
                                {{ $t('menu.addModal.tabOwn') }}
                                <span class="tab-count">{{ ownRecipes.length }}</span>
                            </button>
                            <button
                                type="button"
                                class="tab"
                                :class="{ active: activeTab === 'public' }"
                                @click="activeTab = 'public'"
                            >
                                {{ $t('menu.addModal.tabPublic') }}
                                <span class="tab-count">{{ publicRecipes.length }}</span>
                            </button>
                        </div>

                        <SearchBar
                            v-model="search"
                            :placeholder="$t('menu.addModal.searchPlaceholder')"
                            class="mb-3"
                        />

                        <div v-if="!filteredRecipes.length && activeTab === 'own'" class="empty">
                            <p class="mb-2">{{ $t('menu.addModal.emptyOwn') }}</p>
                            <NuxtLink to="/recipes" class="empty-link" @click="close">
                                {{ $t('menu.addModal.createRecipe') }}
                                <i class="bi bi-arrow-right ms-1"></i>
                            </NuxtLink>
                        </div>

                        <div v-else-if="!filteredRecipes.length" class="empty">
                            <p class="mb-0">{{ $t('menu.addModal.emptySearch') }}</p>
                        </div>

                        <div v-else class="recipe-grid">
                            <button
                                v-for="recipe in filteredRecipes"
                                :key="recipe.id"
                                type="button"
                                class="recipe-card"
                                :class="{ pinned: isPinned(recipe.id) }"
                                @click="togglePin(recipe.id)"
                            >
                                <div class="card-head">
                                    <span class="card-title text-truncate">{{ recipe.name }}</span>
                                    <i v-if="isPinned(recipe.id)" class="bi bi-check-circle-fill"></i>
                                    <i v-else class="bi bi-plus-circle"></i>
                                </div>
                                <p class="card-desc small text-muted mb-2">
                                    {{ recipe.description }}
                                </p>
                                <div class="card-meta small">
                                    <span><i class="bi bi-clock me-1"></i>{{ recipe.time }} {{ $t('menu.addModal.minutes') }}</span>
                                    <span><i class="bi bi-people me-1"></i>{{ recipe.servings }} {{ $t('menu.addModal.people') }}</span>
                                </div>
                                <NuxtLink
                                    v-if="activeTab === 'public'"
                                    :to="`/recipe/${recipe.id}`"
                                    class="card-link"
                                    @click.stop="close"
                                >
                                    {{ $t('menu.addModal.detailsLink') }}
                                    <i class="bi bi-arrow-right ms-1"></i>
                                </NuxtLink>
                            </button>
                        </div>
                    </div>

                    <div class="modal-footer flex-column align-items-stretch gap-2">
                        <p v-if="errorMessage" class="text-danger small mb-0">
                            {{ errorMessage }}
                        </p>
                        <div class="d-flex justify-content-between align-items-center gap-2 flex-wrap">
                            <span class="text-muted small">
                                {{ $t('menu.addModal.selectedCount', { n: pinnedRecipes.length }, pinnedRecipes.length) }}
                            </span>
                            <div class="d-flex gap-2">
                                <button
                                    type="button"
                                    class="btn btn-outline-secondary"
                                    data-bs-dismiss="modal"
                                >
                                    {{ $t('menu.addModal.cancel') }}
                                </button>
                                <Button
                                    color="orange"
                                    :disabled="!canSubmit || isSaving"
                                    @click="handleSave"
                                >
                                    {{ isSaving ? $t('menu.addModal.saving') : $t('menu.addModal.save') }}
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

.pinned-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 0.75rem;
    margin-bottom: 1rem;
    border-radius: var(--radius-sm);
    background: var(--accent-soft);
    border: 1px dashed var(--accent-border);
}

.pinned-label {
    font-size: var(--small-text);
    font-weight: 600;
    color: var(--bs-emphasis-color);
}

.pinned-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.2rem 0.5rem 0.2rem 0.65rem;
    background: var(--grad-orange);
    color: var(--text-light);
    border-radius: var(--radius-sm);
    font-size: var(--small-text);
    font-weight: 500;
}

.chip-remove {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: var(--text-light);
    border-radius: 50%;
    width: 18px;
    height: 18px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    font-size: 12px;
    cursor: pointer;
}

.chip-remove:hover {
    background: rgba(255, 255, 255, 0.4);
}

.mode-toggle {
    display: inline-flex;
    padding: 3px;
    border-radius: var(--radius-sm);
    background: var(--bs-tertiary-bg);
    border: 1px solid var(--bs-border-color);
}

.mode-option {
    padding: 0.35rem 0.9rem;
    font-size: var(--small-text);
    font-weight: 600;
    color: var(--bs-secondary-color);
    cursor: pointer;
    border-radius: var(--radius-sm);
    transition: background 0.15s ease-in, color 0.15s ease-in;
}

.mode-option.active {
    background: var(--bs-body-bg);
    color: var(--orange);
    box-shadow: var(--pill-shadow);
}

.tabs {
    display: flex;
    gap: 1.5rem;
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
}

.tab-count {
    font-size: 11px;
    padding: 1px 6px;
    border-radius: var(--radius-rounded);
    background: var(--bs-tertiary-bg);
    color: var(--bs-secondary-color);
}

.recipe-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 0.75rem;
    max-height: 52vh;
    overflow-y: auto;
    padding-right: 2px;
}

.recipe-card {
    text-align: left;
    background: var(--bs-body-bg);
    border: 1px solid var(--bs-border-color);
    border-radius: var(--radius-sm);
    padding: 0.75rem;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    transition: border-color 0.15s ease-in, background 0.15s ease-in;
}

.recipe-card:hover {
    border-color: var(--orange);
    background: var(--accent-soft);
}

.recipe-card.pinned {
    border-color: var(--orange);
    background: var(--accent-soft);
    box-shadow: inset 0 0 0 1px var(--orange);
}

[data-bs-theme="dark"] .recipe-card:hover,
[data-bs-theme="dark"] .recipe-card.pinned {
    background: rgba(255, 114, 49, 0.1);
}

.card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    font-weight: 600;
    color: var(--bs-emphasis-color);
}

.card-head i {
    color: var(--bs-secondary-color);
}

.recipe-card.pinned .card-head i {
    color: var(--orange);
}

.card-desc {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin: 0;
}

.card-meta {
    display: flex;
    gap: 0.75rem;
    color: var(--bs-secondary-color);
}

.card-link {
    align-self: flex-start;
    margin-top: 0.35rem;
    font-size: var(--small-text);
    font-weight: 600;
    color: var(--orange);
    text-decoration: none;
}

.card-link:hover {
    text-decoration: underline;
}

.empty {
    text-align: center;
    padding: 2rem 1rem;
    color: var(--bs-secondary-color);
}

.empty-link {
    color: var(--orange);
    font-weight: 600;
    text-decoration: none;
}

.empty-link:hover {
    text-decoration: underline;
}

@media (max-width: 576px) {
    .recipe-grid {
        grid-template-columns: 1fr;
        max-height: 48vh;
    }

    .tabs {
        gap: 1rem;
    }

    .mode-toggle {
        width: 100%;
    }

    .mode-option {
        flex: 1;
        text-align: center;
    }
}
</style>
