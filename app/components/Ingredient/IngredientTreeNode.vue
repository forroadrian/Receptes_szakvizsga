<script setup lang="ts">
import type { TaxonomyTreeNode, TaxonomyIngredientNode } from "~/stores/ingredientTaxonomy";

const props = defineProps<{
    node: TaxonomyTreeNode;
    depth: number;
    opened: Set<number>;
    selected: Set<number>;
    txt: (n: TaxonomyTreeNode) => string;
    kids: (n: TaxonomyTreeNode) => TaxonomyTreeNode[];
}>();

const emit = defineEmits<{
    "click-branch": [n: TaxonomyTreeNode];
    "pick-it": [id: number];
}>();

const open = computed(() => props.opened.has(props.node.id));
const subs = computed(() => props.kids(props.node));
const ings = computed(() =>
    [...props.node.ingredients].sort((a, b) => a.name.localeCompare(b.name, "hu")),
);
const hasKids = computed(() => props.node.children.length > 0 || props.node.ingredients.length > 0);

const branchKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        emit("click-branch", props.node);
        return;
    }
    if (e.key === "ArrowRight") {
        e.preventDefault();
        if (!open.value && hasKids.value) {
            emit("click-branch", props.node);
        } else {
            const el = e.currentTarget as HTMLElement;
            el.parentElement?.querySelector<HTMLElement>('ul [role="treeitem"]')?.focus();
        }
    }
    if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (open.value) {
            emit("click-branch", props.node);
        } else {
            const el = e.currentTarget as HTMLElement;
            el.closest("li")?.parentElement?.closest("li")
                ?.querySelector<HTMLElement>(':scope > [role="treeitem"]')?.focus();
        }
    }
};

const leafKey = (e: KeyboardEvent, ing: TaxonomyIngredientNode) => {
    if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        emit("pick-it", ing.id);
    }
    if (e.key === "ArrowLeft") {
        e.preventDefault();
        const el = e.currentTarget as HTMLElement;
        el.closest("li")?.parentElement?.closest("li")
            ?.querySelector<HTMLElement>(':scope > [role="treeitem"]')?.focus();
    }
};
</script>

<template>
    <li class="li">
        <button type="button" class="btn branch" :class="{ open }" role="treeitem"
            :aria-level="depth + 1" :aria-expanded="hasKids ? open : undefined"
            :tabindex="depth === 0 ? 0 : -1" @click="emit('click-branch', node)" @keydown="branchKey">
            <span class="plus" aria-hidden="true">{{ open ? '−' : '+' }}</span>
            <span class="txt">{{ txt(node) }}</span>
        </button>

        <ul v-if="open" class="kids" role="group">
            <IngredientTreeNode v-for="c in subs" :key="`c-${c.id}`" :node="c"
                :depth="depth + 1" :opened="opened" :selected="selected" :txt="txt"
                :kids="kids" @click-branch="(n) => emit('click-branch', n)"
                @pick-it="(id) => emit('pick-it', id)" />

            <li v-for="ing in ings" :key="`i-${ing.id}`" class="li">
                <button type="button" class="btn leaf" :class="{ picked: selected.has(ing.id) }"
                    role="treeitem" :aria-level="depth + 2" :aria-selected="selected.has(ing.id)"
                    tabindex="-1" @click="emit('pick-it', ing.id)"
                    @keydown="(e) => leafKey(e, ing)">
                    <span class="dot" aria-hidden="true">·</span>
                    <span class="txt">{{ ing.name }}</span>
                </button>
            </li>
        </ul>
    </li>
</template>

<style scoped>
.li { display: block; list-style: none; }

.btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    border: 0;
    padding: 6px 8px;
    font: inherit;
    font-weight: 600;
    color: var(--ink);
    cursor: pointer;
    border-radius: 6px;
    width: 100%;
    text-align: left;
    transition: background-color 120ms ease, color 120ms ease, box-shadow 120ms ease;
    -webkit-tap-highlight-color: transparent;
}

.btn:hover { background: var(--paper2); }
.btn:focus { outline: none; }
.btn:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
}

.btn.branch.open { color: var(--accent-ink); }

.btn.picked {
    background: var(--accent-bg);
    color: var(--accent-ink);
    box-shadow: inset 0 0 0 1.5px var(--accent);
    font-weight: 700;
}

.plus {
    display: inline-grid;
    place-items: center;
    width: 18px;
    height: 18px;
    border: 1.5px solid var(--ink);
    border-radius: 4px;
    font-size: 12px;
    line-height: 1;
    background: var(--paper);
    flex: 0 0 auto;
}

.dot {
    display: inline-block;
    width: 18px;
    text-align: center;
    font-size: 22px;
    color: var(--line);
    line-height: 0;
    flex: 0 0 auto;
}

.btn.picked .dot { color: var(--accent); }

.txt {
    flex: 1;
    line-height: 1.2;
    letter-spacing: 0.005em;
}

.kids {
    list-style: none;
    margin: 2px 0 0 16px;
    padding: 0 0 0 10px;
    border-left: 1.5px dotted var(--line);
}

@media (max-width: 768px) {
    .btn {
        padding: 10px 10px;
        font-size: 15px;
    }

    .btn.leaf {
        border: 1.5px solid var(--line);
        border-radius: 10px;
        margin: 4px 0;
        background: var(--paper2);
    }

    .btn.leaf.picked {
        border-color: var(--accent);
        background: var(--accent-bg);
    }

    .kids {
        margin-left: 10px;
        padding-left: 10px;
    }
}

@media (prefers-reduced-motion: reduce) {
    .btn { transition: none; }
}
</style>
