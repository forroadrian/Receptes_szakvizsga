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
    <div class="profile-section-actions mt-auto d-flex flex-row gap-3 justify-content-end">
        <Button
            type="button"
            color="outline-dark"
            class="profile-action-button btn-lg px-5 rounded-pill"
            @click="$emit('cancel')"
        >
            Mégsem
        </Button>

        <Button
            type="button"
            color="dark"
            class="profile-action-button btn-lg px-5 rounded-pill"
            :disabled="saveDisabled"
            @click="$emit('save')"
        >
            {{ saveText }}
        </Button>
    </div>
</template>

<style scoped>
.profile-section-actions :deep(.profile-action-button) {
    flex: 1 1 0;
    min-width: 0;
    width: auto;
}

@media (min-width: 576px) {
    .profile-section-actions {
        flex-wrap: wrap;
    }

    .profile-section-actions :deep(.profile-action-button) {
        width: auto;
        min-width: 180px;
    }
}

@media (min-width: 576px) and (max-width: 767.98px) {
    .profile-section-actions :deep(.profile-action-button) {
        flex: 1 1 0;
        min-width: 0;
        padding-inline: 1.75rem !important;
    }
}
</style>
