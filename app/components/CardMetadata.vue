<template>
    <div class="card-metadata d-flex flex-wrap gap-3 align-items-center text-body-secondary small">
        <slot></slot>
    </div>
</template>

<style scoped>
.card-metadata {
    gap: 0.75rem;
}

.card-metadata > * {
    font-weight: 600;
}

</style>
