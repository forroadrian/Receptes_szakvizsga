<script setup lang="ts">
import type Pill from '~/interfaces/Pill';

const model = defineModel()

const emit = defineEmits(['chose'])

const props = withDefaults(
    defineProps<{
        pills: Pill[],
        interactive?: boolean,
        modelValue?: number | null,
        icon?: string,
        size? : string,
    }>(),
    {
        interactive: false,
        modelValue: null,
        icon: "bi-tag-fill"
    }
);

const handleClick = (id: number) => {
    if (!props.interactive) return;
    model.value = props.modelValue === id ? null : id;
    emit('chose',model.value)
};
</script>
<template>
    <div class="my-4" :class="{'row': size !== undefined, 'd-flex flex-wrap categories gap-2': size === undefined}">
        <span
            v-for="pill in pills" class="badge rounded-pill tag-pill" @click="handleClick(pill.identifier)" 
            :class="[interactive ? 'interactive' : 'static', model === pill.identifier ? 'active' : 'inactive', size]">
            <i class="bi me-2" :class="[icon]"></i> {{ pill.name }}
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