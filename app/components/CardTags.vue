<script setup lang="ts">
import { type CardTagItem } from '~/interfaces/cardInterfaces/CardGenericInterfaces';


const colorMode = useColorMode()

const buttonColor = computed(() => {
    return colorMode.value === "dark" ? "#e9ecef" : "#444";
})

const textColor = computed(() => {
    return colorMode.value === "dark" ? "#000" : "#fff";
})

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
        background-color: v-bind(buttonColor);
        color: v-bind(textColor);
    }

    .card-tag--outline {
        background-color: transparent;
        color: var(--bs-body-color);
        border: 1px solid var(--bs-border-color);
    }

    .card-tag--greyed {
        background-color: v-bind(buttonColor);
        color: var(--bs-body-color);
    }

    .card-tag--custom {
        background-color: #a52a2a;
        color: #fff;
    }

    .card-tag--warning {
        background-color: var(--orange);
        color: #fff;
    }
</style>