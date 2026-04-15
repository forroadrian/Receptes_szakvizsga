<script setup lang="ts">
import type Category from "~/interfaces/Category";

const props = withDefaults(
    defineProps<{
        categories: Category[];
        interactive?: boolean;
        modelValue?: number | null;
    }>(),
    {
        interactive: false,
        modelValue: null
    }
);

const emit = defineEmits<{
    (e: "update:modelValue", value: number | null): void
}>();

const handleClick = (id: number) => {
    if (!props.interactive) return;
    emit("update:modelValue", props.modelValue === id ? null : id);
};
</script>
<template>
    <div class="d-flex flex-wrap gap-2 my-4 categories">
        <span
            v-for="category in categories" class="badge rounded-pill tag-pill" @click="handleClick(category.id)" 
            :class="[interactive ? 'interactive' : 'static', modelValue === category.id ? 'active' : 'inactive']">
            <i class="bi bi-tag-fill me-2"></i> {{ category.name }}
        </span>
    </div>
</template>

<style scoped>
.tag-pill {
    padding: 8px 14px;
    font-size: 14px;
    border: 1px solid var(--pill-border);
    transition: all 200ms ease;
}

.static {
    cursor: default;
    pointer-events: none;
}

.interactive {
    cursor: pointer;
}

.interactive:hover {
    opacity: 0.75;
}

.active {
    background-color: var(--active-bg);
    color: var(--active-text);
    font-weight: 700;
    border: 2px solid var(--pill-primary-strong);
}

.inactive {
    background-color: transparent;
    color: var(--bs-secondary-color);
}

@media (max-width: 992px) {
    .categories {
        display: flex;
        justify-content: center;
    }
}
</style>