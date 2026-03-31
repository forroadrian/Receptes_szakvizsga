<script setup>
defineEmits(['click']);

defineProps({
    icon: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
});
</script>

<template>
    <button type="button" class="settings-option" @click="$emit('click')">
        <div class="settings-option-left">
            <div class="settings-option-icon">
                <i class="bi" :class="icon"></i>
            </div>

            <div class="settings-option-text">
                <h5 class="mb-1">{{ title }}</h5>
                <p v-if="description" class="mb-0">{{ description }}</p>
            </div>
        </div>

        <div class="settings-option-arrow">
            <i class="bi bi-arrow-right"></i>
        </div>
    </button>
</template>