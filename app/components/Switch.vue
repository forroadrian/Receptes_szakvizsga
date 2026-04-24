<script setup lang="ts">
const props = withDefaults(defineProps<{
    modelValue: boolean;
    label?: string;
    icon?: string;
}>(), {});

const emit = defineEmits<{ 'update:modelValue': [boolean] }>();
</script>

<template>
    <button type="button" class="grad-switch d-inline-flex gap-1 p-0" :class="{ active: modelValue }" 
    @click="emit('update:modelValue', !modelValue)">
        <span class="grad-switch-thumb d-flex">
            <i v-if="icon" :class="icon"></i>
        </span>
        <span v-if="label" class="grad-switch-label">{{ label }}</span>
    </button>
</template>

<style scoped>
.grad-switch {
    background: none;
    border: none;
    cursor: pointer;
}

.grad-switch-thumb {
    position: relative;
    width: 44px;
    height: 24px;
    border-radius: var(--radius-sm);
    background: var(--grad-yellow);
    transition: background 0.25s ease;
    flex-shrink: 0;
   
}

.grad-switch,.grad-switch-thumb {
 align-items: center;
}

.grad-switch-thumb::after {
    content: "";
    position: absolute;
    left: 3px;
    width: 18px;
    height: 18px;
    border-radius: var(--radius-rounded);
    background: var(--text-light);
    box-shadow: 0 2px 6px rgba(0,0,0,0.18);
    transition: transform 0.25s ease;
}

.grad-switch.active .grad-switch-thumb {
    background: var(--grad-orange);
}

.grad-switch.active .grad-switch-thumb::after {
    transform: translateX(20px);
}

.grad-switch-thumb i {
    position: absolute;
    right: 4px;
    color: rgba(255,255,255,0.85);
    transition: opacity 0.2s;
    z-index: 1;
}

.grad-switch.active .grad-switch-thumb i {
    right: auto;
    left: 4px;
}

.grad-switch-label {
    color: var(--bs-body-color);
    user-select: none;
}
</style>