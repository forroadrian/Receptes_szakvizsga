<script setup lang="ts">
import type CardTagItem from '~/interfaces/cardInterfaces/CardGenericInterfaces';

const props = defineProps<{
    items: CardTagItem[]
}>()

</script>
<template>
    <div class="card-tags d-flex flex-wrap gap-2 align-items-center">
        <template v-if="items.length">
            <span v-for="pill in items" class="card-tag rounded-pill badge" :class="'card-tag--'+pill.variant">{{ pill.label }}</span>
        </template>
        <slot v-else></slot>
    </div>
</template>

<style scoped>
    .card-tag--active {
        background-color: #212529;
        color: #ffffff;
    }

    .card-tag--outline {
        background-color: transparent;
        color: var(--bs-body-color);
        border: 1px solid rgba(0, 0, 0, 0.2);
    }

    .card-tag--greyed {
        background-color: #e9ecef;
        color: var(--bs-body-color);
    }
</style>