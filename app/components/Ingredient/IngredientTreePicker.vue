<script setup lang="ts">
import { useMediaQuery } from "@vueuse/core";
import type { TaxonomyTreeNode } from "~/stores/ingredientTaxonomy";
import IngredientTreeNode from "./IngredientTreeNode.vue";

const props = withDefaults(defineProps<{
    nodes: TaxonomyTreeNode[];
    selected?: Set<number>;
    multiple?: boolean;
}>(), {
    selected: () => new Set<number>(),
    multiple: true,
});

const emit = defineEmits<{
    "update:selected": [value: Set<number>];
}>();

const { t } = useI18n();
const mobile = useMediaQuery("(max-width: 768px)");
const opened = reactive(new Set<number>());
const root = ref<HTMLUListElement | null>(null);

const txt = (n: TaxonomyTreeNode) => {
    const k = `categories.tree.${n.slug}`;
    const out = t(k);
    return out === k ? n.slug : out;
};

const kids = (n: TaxonomyTreeNode) =>
    [...n.children].sort((a, b) => txt(a).localeCompare(txt(b), "hu"));

const tops = computed(() => [...props.nodes].sort((a, b) => txt(a).localeCompare(txt(b), "hu")));

const closeAll = (n: TaxonomyTreeNode) => {
    opened.delete(n.id);
    for (const c of n.children) closeAll(c);
};

const depths = computed(() => {
    const m = new Map<number, number>();
    const walk = (list: TaxonomyTreeNode[], d: number) => {
        for (const n of list) {
            m.set(n.id, d);
            walk(n.children, d + 1);
        }
    };
    walk(props.nodes, 0);
    return m;
});

const getSiblings = (id: number): TaxonomyTreeNode[] => {
    const target = depths.value.get(id);
    if (target == null) return [];
    let out: TaxonomyTreeNode[] = [];
    const walk = (list: TaxonomyTreeNode[], d: number, parent: TaxonomyTreeNode | null) => {
        if (d === target && list.find((n) => n.id === id)) {
            out = parent ? kids(parent) : [...list].sort((a, b) => txt(a).localeCompare(txt(b), "hu"));
            return;
        }
        for (const n of list) walk(n.children, d + 1, n);
    };
    walk(props.nodes, 0, null);
    return out;
};

const clickBranch = (n: TaxonomyTreeNode) => {
    if (opened.has(n.id)) {
        closeAll(n);
        return;
    }
    if (mobile.value) {
        for (const s of getSiblings(n.id)) {
            if (s.id !== n.id && opened.has(s.id)) closeAll(s);
        }
    }
    opened.add(n.id);
};

const pickIt = (id: number) => {
    const next = new Set(props.selected);
    if (next.has(id)) {
        next.delete(id);
    } else {
        if (!props.multiple) next.clear();
        next.add(id);
    }
    emit("update:selected", next);
};

const rows = () => Array.from(root.value?.querySelectorAll<HTMLElement>('[role="treeitem"]') ?? []);

const move = (cur: HTMLElement, step: number) => {
    const r = rows();
    const i = r.indexOf(cur);
    if (i < 0) return;
    r[Math.max(0, Math.min(r.length - 1, i + step))]?.focus();
};

const onKey = (e: KeyboardEvent) => {
    const el = e.target as HTMLElement | null;
    if (!el || el.getAttribute("role") !== "treeitem") return;
    const r = rows();
    if (e.key === "ArrowDown") { e.preventDefault(); move(el, 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); move(el, -1); }
    else if (e.key === "Home") { e.preventDefault(); r[0]?.focus(); }
    else if (e.key === "End") { e.preventDefault(); r[r.length - 1]?.focus(); }
};
</script>

<template>
    <ul ref="root" class="tree" role="tree" :aria-multiselectable="multiple" @keydown="onKey">
        <IngredientTreeNode v-for="n in tops" :key="n.id" :node="n" :depth="0" :opened="opened"
            :selected="selected" :txt="txt" :kids="kids" @click-branch="clickBranch"
            @pick-it="pickIt" />
    </ul>
</template>

<style scoped>
.tree {
    --ink: var(--pill-text);
    --ink2: var(--pill-text-muted);
    --paper: var(--bs-body-bg);
    --paper2: var(--accent-soft);
    --line: var(--accent-border);
    --accent: var(--orange);
    --accent-bg: var(--active-bg);
    --accent-ink: var(--text-dark);

    list-style: none;
    margin: 0;
    padding: 0;
    color: var(--ink);
    font-family: "Poppins", sans-serif;
    font-weight: 600;
}

[data-bs-theme="dark"] .tree {
    --ink: var(--bs-body-color);
    --ink2: var(--bs-secondary-color);
    --paper: var(--bs-body-bg);
    --paper2: rgba(255, 177, 94, 0.08);
    --line: rgba(214, 188, 142, 0.4);
    --accent: #ffb15e;
    --accent-bg: rgba(255, 177, 94, 0.18);
    --accent-ink: #ffd29a;
}

@media (max-width: 768px) {
    .tree { font-size: 15px; }
}
</style>
