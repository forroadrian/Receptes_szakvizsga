<script setup lang="ts">
import type Pill from '~/interfaces/Pill';

const model = defineModel()

const emit = defineEmits(['chose', 'remove'])

const props = withDefaults(
    defineProps<{
        pills: Pill[],
        interactive?: boolean,
        modelValue?: number | null,
        icon?: string,
        size? : string,
        removable?: boolean,
    }>(),
    {
        interactive: false,
        modelValue: null,
        icon: "bi-tag-fill",
        removable: false,
    }
);

const handleClick = (id: number) => {
    if (!props.interactive) return;

    if (props.modelValue === undefined) {
        emit('chose', id);
        model.value = null;
        return;
    }

    model.value = props.modelValue === id ? null : id;
    emit('chose',model.value);
};

const handleRemove = (id: number) => {
    emit('remove', id);
};
</script>
<template>
    <div class="my-4" :class="{'row': size !== undefined, 'd-flex flex-wrap categories gap-2': size === undefined}">
        <span
            v-for="pill in pills" class="badge rounded-pill tag-pill" @click="handleClick(pill.identifier)" 
            :class="[(interactive || removable) ? 'interactive' : 'static', model === pill.identifier ? 'active' : 'inactive', size]">
            <i class="bi me-2" :class="[icon]"></i> {{ pill.name }}
            <i v-if="removable" class="bi bi-x ms-2 remove-btn" @click.stop="handleRemove(pill.identifier)"></i>
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

.remove-btn {
    cursor: pointer;
    font-size: 14px;
}

.remove-btn:hover {
    opacity: 0.7;
}

@media (max-width: 992px) {
    .categories {
        display: flex;
        justify-content: center;
    }
}
</style>