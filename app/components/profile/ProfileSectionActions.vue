<script setup>
defineEmits(['cancel', 'save']);

defineProps({
    saveText: {
        type: String,
        default: 'Mentés',
    },
    saveDisabled: {
        type: Boolean,
        default: false,
    },
});
</script>

<template>
    <div class="mt-auto d-flex flex-column flex-sm-row gap-3 justify-content-end">
        <Button type="button" color="outline-dark" class="btn-lg px-5 rounded-pill" @click="$emit('cancel')">
            Mégsem
        </Button>

        <Button type="button" color="dark" class="btn-lg px-5 rounded-pill" :disabled="saveDisabled"
            @click="$emit('save')">
            {{ saveText }}
        </Button>
    </div>
</template>