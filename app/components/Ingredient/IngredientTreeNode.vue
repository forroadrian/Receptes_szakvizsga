<script setup lang="ts">
import type { TaxonomyTreeNode, TaxonomyIngredientNode } from "~/stores/ingredientTaxonomy";

const props = defineProps<{
    node: TaxonomyTreeNode;
    depth: number;
    opened: Set<number>;
    selected: Set<number>;
    txt: (n: TaxonomyTreeNode) => string;
    kids: (n: TaxonomyTreeNode) => TaxonomyTreeNode[];
    leafLabel: (n: TaxonomyIngredientNode) => string;
    matchSet?: Set<number>;
    searching?: boolean;
}>();

const emit = defineEmits<{
    "click-branch": [n: TaxonomyTreeNode];
    "pick-it": [id: number];
}>();

const open = computed(() => props.opened.has(props.node.id));
const subs = computed(() => props.kids(props.node));
const ings = computed(() =>
    [...props.node.ingredients].sort((a, b) =>
        props.leafLabel(a).localeCompare(props.leafLabel(b), "hu")
    ),
);
const hasKids = computed(() => props.node.children.length > 0 || props.node.ingredients.length > 0);
const isMatched = (id: number) => Boolean(props.searching && props.matchSet?.has(id));

const onBranchClick = () => {
    if (props.searching) return;
    emit("click-branch", props.node);
};

const branchKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!props.searching) emit("click-branch", props.node);
        return;
    }
    if (e.key === "ArrowRight") {
        e.preventDefault();
        const el = e.currentTarget as HTMLElement;
        if (props.searching || open.value) {
            el.parentElement?.querySelector<HTMLElement>('ul [role="treeitem"]')?.focus();
        } else if (hasKids.value) {
            emit("click-branch", props.node);
        }
    }
    if (e.key === "ArrowLeft") {
        e.preventDefault();
        const el = e.currentTarget as HTMLElement;
        if (!props.searching && open.value) {
            emit("click-branch", props.node);
        } else {
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
        <button type="button" class="btn branch"
            :class="{ open, locked: searching }"
            role="treeitem"
            :aria-level="depth + 1"
            :aria-expanded="hasKids ? open : undefined"
            :tabindex="depth === 0 ? 0 : -1"
            @click="onBranchClick"
            @keydown="branchKey">
            <span class="indicator" aria-hidden="true">
                <i v-if="searching" class="bi bi-folder2-open"></i>
                <template v-else>{{ open ? '−' : '+' }}</template>
            </span>
            <span class="txt">{{ txt(node) }}</span>
        </button>

        <ul v-if="open" class="kids" role="group">
            <IngredientTreeNode v-for="c in subs" :key="`c-${c.id}`"
                :node="c" :depth="depth + 1"
                :opened="opened" :selected="selected"
                :txt="txt" :kids="kids" :leaf-label="leafLabel"
                :match-set="matchSet" :searching="searching"
                @click-branch="(n) => emit('click-branch', n)"
                @pick-it="(id) => emit('pick-it', id)" />

            <li v-for="ing in ings" :key="`i-${ing.id}`" class="li">
                <button type="button" class="btn leaf"
                    :class="{ picked: selected.has(ing.id), matched: isMatched(ing.id) }"
                    role="treeitem"
                    :aria-level="depth + 2"
                    :aria-selected="selected.has(ing.id)"
                    tabindex="-1"
                    @click="emit('pick-it', ing.id)"
                    @keydown="(e) => leafKey(e, ing)">
                    <span class="dot" aria-hidden="true">·</span>
                    <span class="txt">{{ leafLabel(ing) }}</span>
                    <i v-if="selected.has(ing.id)" class="bi bi-check2 check" aria-hidden="true"></i>
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
.btn.branch.locked { cursor: default; }
.btn.branch.locked:hover { background: transparent; }

.btn.picked {
    background: var(--accent-bg);
    color: var(--accent-ink);
    box-shadow: inset 0 0 0 1.5px var(--accent);
    font-weight: 700;
}

.btn.leaf.matched:not(.picked) {
    background: color-mix(in srgb, var(--accent) 12%, transparent);
}

.btn.leaf.matched .txt {
    text-decoration: underline;
    text-decoration-color: var(--accent);
    text-decoration-thickness: 1.5px;
    text-underline-offset: 3px;
}

.indicator {
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

.btn.branch.locked .indicator {
    border-color: var(--line);
    color: var(--ink2);
    font-size: 10px;
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

.check {
    color: var(--accent);
    font-size: 14px;
    flex: 0 0 auto;
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

    .btn.leaf.matched:not(.picked) {
        border-color: var(--accent);
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
