<script setup lang="ts">
import { useIngredientTaxonomyStore } from "~/stores/ingredientTaxonomy";
import IngredientTreePicker from "./IngredientTreePicker.vue";

const props = withDefaults(defineProps<{
    selected: Set<number>;
    multiple?: boolean;
    placeholder?: string;
    autofocusSearch?: boolean;
    showSelectedSummary?: boolean;
    minHeight?: string;
    maxHeight?: string;
}>(), {
    multiple: false,
    placeholder: "",
    autofocusSearch: false,
    showSelectedSummary: true,
    minHeight: "",
    maxHeight: "",
});

const emit = defineEmits<{
    "update:selected": [value: Set<number>];
    "pick": [id: number];
}>();

const { t } = useI18n();
const { formatIngredient } = useIngredientFormatter();
const taxonomy = useIngredientTaxonomyStore();

const query = ref("");
const inputEl = ref<HTMLInputElement | null>(null);
const visibleCount = ref(-1);

onMounted(async () => {
    if (!taxonomy.loaded && !taxonomy.loading) await taxonomy.load();
    if (props.autofocusSearch) {
        await nextTick();
        inputEl.value?.focus();
    }
});

const placeholderText = computed(() =>
    props.placeholder || t("ingredientPicker.searchPlaceholder")
);

const isLoading = computed(() => taxonomy.loading && !taxonomy.loaded);
const hasTree = computed(() => taxonomy.tree.length > 0);
const isSearching = computed(() => query.value.trim() !== "");
const noResults = computed(() => isSearching.value && visibleCount.value === 0);

const onSelectionUpdate = (next: Set<number>) => {
    if (!props.multiple) {
        for (const id of next) {
            if (!props.selected.has(id)) emit("pick", id);
        }
    }
    emit("update:selected", next);
};

const removeSelected = (id: number) => {
    const next = new Set(props.selected);
    next.delete(id);
    emit("update:selected", next);
};

const clearQuery = () => {
    query.value = "";
    inputEl.value?.focus();
};

const selectedList = computed(() =>
    Array.from(props.selected).map((id) => ({
        id,
        label: formatIngredient(id) || String(id),
    }))
);

const showSelectedRow = computed(() =>
    props.showSelectedSummary && props.multiple && selectedList.value.length > 0
);

const treeStyle = computed(() => {
    const s: Record<string, string> = {};
    if (props.minHeight) s.minHeight = props.minHeight;
    if (props.maxHeight) s.maxHeight = props.maxHeight;
    return s;
});
</script>

<template>
    <div class="ing-picker">
        <div class="picker-search" :class="{ active: isSearching }">
            <i class="bi bi-search picker-search-icon" aria-hidden="true"></i>
            <input
                ref="inputEl"
                v-model="query"
                type="text"
                :placeholder="placeholderText"
                :aria-label="placeholderText"
                autocomplete="off"
                spellcheck="false"
                class="picker-search-input"
            />
            <button
                v-if="isSearching"
                type="button"
                class="picker-clear"
                :aria-label="t('ingredientPicker.clearSearch')"
                @click="clearQuery"
            >
                <i class="bi bi-x-lg" aria-hidden="true"></i>
            </button>
        </div>

        <div v-if="showSelectedRow" class="picker-selected">
            <p class="picker-selected-eyebrow">
                {{ t('ingredientPicker.selectedCount', { n: selectedList.length }) }}
            </p>
            <div class="picker-selected-pills">
                <button
                    v-for="item in selectedList"
                    :key="item.id"
                    type="button"
                    class="picker-pill"
                    :aria-label="t('ingredientPicker.removeIngredient', { name: item.label })"
                    @click="removeSelected(item.id)"
                >
                    <span class="picker-pill-name">{{ item.label }}</span>
                    <i class="bi bi-x picker-pill-x" aria-hidden="true"></i>
                </button>
            </div>
        </div>

        <div class="picker-tree-wrap" :style="treeStyle">
            <p v-if="isLoading" class="picker-state">
                <span class="picker-state-spinner" aria-hidden="true"></span>
                {{ t('common.loading') }}
            </p>
            <div v-else-if="noResults" class="picker-state picker-empty">
                <i class="bi bi-search-heart picker-empty-icon" aria-hidden="true"></i>
                <p class="picker-empty-title">{{ t('ingredientPicker.noResults.title') }}</p>
                <p class="picker-empty-hint">{{ t('ingredientPicker.noResults.hint', { q: query }) }}</p>
            </div>
            <p v-else-if="!hasTree" class="picker-state">{{ t('ingredientPicker.empty') }}</p>
            <IngredientTreePicker
                v-else
                :nodes="taxonomy.tree"
                :selected="selected"
                :multiple="multiple"
                :query="query"
                @update:selected="onSelectionUpdate"
                @update:visible-count="(n) => (visibleCount = n)"
            />
        </div>
    </div>
</template>

<style scoped>
.ing-picker {
    display: flex;
    flex-direction: column;
    gap: 12px;
    font-family: "Poppins", sans-serif;
}

.picker-search {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: var(--bs-body-bg);
    border: 1.5px solid var(--bs-border-color);
    border-radius: var(--radius-sm);
    transition: border-color 140ms ease, box-shadow 140ms ease;
}

.picker-search:focus-within {
    border-color: var(--accent-border);
    box-shadow: 0 0 0 3px var(--accent-shadow);
}

.picker-search.active {
    border-color: var(--accent-border);
}

.picker-search-icon {
    color: var(--bs-secondary-color);
    font-size: 15px;
    flex: 0 0 auto;
}

.picker-search-input {
    flex: 1;
    border: 0;
    outline: none;
    background: transparent;
    color: var(--bs-body-color);
    font: inherit;
    font-size: 15px;
    min-width: 0;
}

.picker-search-input::placeholder {
    color: var(--bs-secondary-color);
    font-style: italic;
}

.picker-clear {
    flex: 0 0 auto;
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

.picker-clear:hover {
    background: var(--accent-soft);
    color: var(--orange);
}

.picker-selected {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-bottom: 10px;
    border-bottom: 1.5px dotted var(--accent-border);
}

.picker-selected-eyebrow {
    margin: 0;
    font-family: "Caveat", cursive;
    font-weight: 600;
    font-size: 18px;
    color: var(--bs-emphasis-color);
    line-height: 1;
}

.picker-selected-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.picker-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 4px 4px 10px;
    background: var(--active-bg);
    color: var(--text-dark);
    border: 1.5px solid var(--pill-primary);
    border-radius: var(--radius-rounded);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 120ms ease, transform 120ms ease;
}

.picker-pill:hover {
    background: var(--accent-soft-strong);
    transform: translateY(-1px);
}

.picker-pill:focus-visible {
    outline: 2px solid var(--orange);
    outline-offset: 2px;
}

.picker-pill-x {
    display: inline-grid;
    place-items: center;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--bs-body-bg);
    font-size: 12px;
    color: var(--pill-primary-strong);
}

[data-bs-theme="dark"] .picker-pill {
    background: rgba(255, 177, 94, 0.18);
    color: #ffd29a;
    border-color: rgba(255, 177, 94, 0.65);
}

[data-bs-theme="dark"] .picker-pill-x {
    background: var(--bs-body-bg);
    color: #ffd29a;
}

.picker-tree-wrap {
    overflow-y: auto;
    padding: 4px 4px 4px 0;
}

.picker-tree-wrap::-webkit-scrollbar {
    width: 8px;
}
.picker-tree-wrap::-webkit-scrollbar-thumb {
    background: var(--accent-soft-strong);
    border-radius: 8px;
}
.picker-tree-wrap::-webkit-scrollbar-thumb:hover {
    background: var(--pill-primary);
}

.picker-state {
    margin: 0;
    padding: 1.5rem 1rem;
    text-align: center;
    color: var(--bs-secondary-color);
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.picker-state-spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid var(--bs-border-color);
    border-top-color: var(--orange);
    border-radius: 50%;
    animation: picker-spin 0.7s linear infinite;
}

@keyframes picker-spin {
    to { transform: rotate(360deg); }
}

.picker-empty {
    flex-direction: column;
    gap: 4px;
    padding: 1.75rem 1rem;
}

.picker-empty-icon {
    font-size: 28px;
    color: var(--orange);
    margin-bottom: 4px;
}

.picker-empty-title {
    margin: 0;
    font-family: "Caveat", cursive;
    font-weight: 600;
    font-size: 22px;
    color: var(--bs-emphasis-color);
    line-height: 1.1;
}

.picker-empty-hint {
    margin: 0;
    font-size: 13px;
    color: var(--bs-secondary-color);
}

@media (prefers-reduced-motion: reduce) {
    .picker-state-spinner { animation: none; }
    .picker-search,
    .picker-pill,
    .picker-clear { transition: none; }
}
</style>
