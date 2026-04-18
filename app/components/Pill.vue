<script setup lang="ts">
import type Pill from '~/interfaces/Pill';

const emit = defineEmits(['click', 'remove'])

withDefaults(
    defineProps<{
        pill: Pill,
        interactive?: boolean,
        active?: boolean,
        icon?: string,
        size?: string,
        removable?: boolean,
    }>(),
    {
        interactive: false,
        active: false,
        icon: "bi-tag-fill",
        removable: false,
    }
);

const handleClick = () => {
    emit('click');
};

const handleRemove = () => {
    emit('remove');
};
</script>
<template>
    <span
        class="badge rounded-pill tag-pill"
        @click="handleClick"
        :class="[(interactive || removable) ? 'interactive' : 'static', active ? 'active' : 'inactive', size]">
        <i class="bi me-2" :class="[icon]"></i> {{ pill.name }}
        <i v-if="removable" class="bi bi-x ms-2 remove-btn" @click.stop="handleRemove"></i>
    </span>
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
</style>
