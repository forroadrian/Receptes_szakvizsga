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
});
</script>

<template>
    <button type="button" class="settings-option" @click="$emit('click')">
        <div class="settings-option-left">
            <i class="bi" :class="icon"></i>
            <div>
                <h5 class="mb-1">{{ title }}</h5>
            </div>
        </div>
        <i class="bi bi-chevron-right"></i>
    </button>
</template>