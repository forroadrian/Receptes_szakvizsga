<script setup lang="ts">
import { computed, ref } from "vue";
import { MatcherPatternQueryParam } from "vue-router/dist/experimental/index.mjs";
import type Ingredient from "~/models/Ingredient";
import { daysFromToday } from "~/utils/budapestDate";

const props = defineProps<{
    ingredient: Ingredient;
    highlight?: boolean;
}>();

const emit = defineEmits<{
    (e: "delete", ingredient: Ingredient): void;
    (e: "edit", ingredient: Ingredient): void;
}>();

const { t } = useI18n();
const { formatUnit } = useUnitFormatter();
const { formatIngredient } = useIngredientFormatter();
const confirmingDelete = ref(false);

const freshnessConfig = computed(() => {
    switch (props.ingredient.tag) {
        case "fresh":
            return { icon: "bi bi-leaf", class: "fresh" };
        case "soon":
            return { icon: "bi bi-clock-history", class: "warning" };
        default:
            return { icon: "bi bi-exclamation-triangle-fill", class: "expired" };
    }
});

const relativeExpiry = computed(() => {
    const d = daysFromToday(props.ingredient.expiry.toStamp());
    if (d < 0) {
        const n = Math.abs(d);
        return t("pantry.row.relativeExpiry.expired", { count: n }, n);
    }
    if (d === 0) return t("pantry.row.relativeExpiry.today");
    if (d === 1) return t("pantry.row.relativeExpiry.tomorrow");
    if (d < 7) return t("pantry.row.relativeExpiry.inDays", { count: d }, d);
    return props.ingredient.expiry.toShort();
});

const requestDelete = () => {
    confirmingDelete.value = true;
    setTimeout(() => (confirmingDelete.value = false), 3000);
};

const confirmDelete = () => {
    confirmingDelete.value = false;
    emit("delete", props.ingredient);
};
</script>

<template>
    <div class="row-item" :class="[freshnessConfig.class, { highlight }]">
        <span class="accent-bar" :class="freshnessConfig.class"></span>

        <div class="icon-box" :class="freshnessConfig.class">
            <i :class="freshnessConfig.icon"></i>
        </div>

        <div class="main">
            <div class="top-line">
                <span class="name">{{ formatIngredient(ingredient.id) }}</span>
                <span class="tag" :class="freshnessConfig.class">{{ $t('common.tags.' + ingredient.tag) }}</span>
            </div>
            <div class="sub-line">
                <span class="qty">{{ ingredient.quantity }} {{ formatUnit(ingredient.unit) }}</span>
                <span class="sep">·</span>
                <span class="date">
                    <i class="bi bi-calendar2-event me-1"></i>
                    {{ relativeExpiry }}
                </span>
            </div>
        </div>

        <div class="actions">
            <button
                type="button"
                class="action-btn action-edit"
                :title="$t('pantry.row.actions.edit')"
                @click="emit('edit', ingredient)"
            >
                <i class="bi bi-pencil"></i>
            </button>
            <button
                v-if="!confirmingDelete"
                type="button"
                class="action-btn"
                :title="$t('pantry.row.actions.delete')"
                @click="requestDelete"
            >
                <i class="bi bi-trash3"></i>
            </button>
            <button
                v-else
                type="button"
                class="action-btn confirm"
                :title="$t('pantry.row.actions.confirm')"
                @click="confirmDelete"
            >
                {{ $t('common.actions.confirmShort') }}
            </button>
        </div>
    </div>
</template>

<style scoped>
.row-item {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 0.6rem 0.85rem 0.6rem 1.1rem;
    border: 1px solid var(--bs-border-color);
    border-radius: var(--radius-sm);
    background: var(--bs-body-bg);
    transition: border-color 0.15s ease-in, background 0.2s ease-out, transform 0.15s ease-in;
}

.row-item:hover {
    border-color: var(--orange);
}

.row-item.highlight {
    animation: highlight-flash 1.2s ease-out;
}

@keyframes highlight-flash {
    0% {
        background: rgba(255, 114, 49, 0.18);
        border-color: var(--orange);
    }
    100% {
        background: var(--bs-body-bg);
    }
}

.accent-bar {
    position: absolute;
    top: 8px;
    bottom: 8px;
    left: 0;
    width: 3px;
    border-radius: 0 3px 3px 0;
}

.accent-bar.fresh { background: var(--green); }
.accent-bar.warning { background: var(--yellow); }
.accent-bar.expired { background: #d64545; }

.icon-box {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    border-radius: var(--radius-sm);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
}

.icon-box.fresh {
    background: rgba(53, 165, 90, 0.12);
    color: var(--green);
}

.icon-box.warning {
    background: rgba(250, 180, 100, 0.18);
    color: #c78c3a;
}

.icon-box.expired {
    background: rgba(214, 69, 69, 0.15);
    color: #d64545;
}

.main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.top-line {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
}

.name {
    font-weight: 600;
    color: var(--bs-emphasis-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.tag {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 1px 7px;
    border-radius: var(--radius-sm);
}

.tag.fresh {
    background: rgba(53, 165, 90, 0.14);
    color: var(--green);
}

.tag.warning {
    background: rgba(250, 180, 100, 0.2);
    color: #b4750f;
}

.tag.expired {
    background: rgba(214, 69, 69, 0.15);
    color: #d64545;
}

.sub-line {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: var(--small-text);
    color: var(--bs-secondary-color);
    flex-wrap: wrap;
}

.sep {
    opacity: 0.5;
}

.actions {
    margin-left: auto;
    flex-shrink: 0;
    display: flex;
    gap: 0.35rem;
}

.action-btn {
    background: none;
    border: 1px solid var(--bs-border-color);
    color: var(--bs-secondary-color);
    width: 34px;
    height: 34px;
    border-radius: var(--radius-sm);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s ease-in;
    font-size: 14px;
}

.action-btn:hover {
    color: #d64545;
    border-color: #d64545;
}

.action-btn.action-edit:hover {
    color: var(--orange);
    border-color: var(--orange);
}

.action-btn.confirm {
    width: auto;
    padding: 0 0.6rem;
    font-size: 12px;
    font-weight: 600;
    color: #d64545;
    border-color: #d64545;
}

@media (max-width: 576px) {
    .row-item {
        padding: 0.55rem 0.7rem 0.55rem 1rem;
        gap: 0.65rem;
    }

    .icon-box {
        width: 32px;
        height: 32px;
        font-size: 16px;
    }

    .tag {
        display: none;
    }
}
</style>
