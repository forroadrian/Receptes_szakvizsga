<script setup lang="ts">
import type { CardTagItem, FreshnessVariants } from '~/interfaces/cardInterfaces/CardGenericInterfaces';


const props = withDefaults(defineProps<{
    name: string,
    amount: number,
    image?: string,
    expiry?: string,
    unit: string,
    tag: FreshnessVariants,
    alt?: string
}>(), {
    image: "#",
    expiry: "2006-01-01",
    alt: "alt title"
})

const items = computed(() => {
    const tag = props.tag
    const variant = tag === 'Friss'
        ? 'active' 
        : tag === "Hamarosan Lejár" 
            ? "outline" 
            : "greyed"
    return [{label: tag, variant: variant} as CardTagItem]
})  

</script>
<template>
    <CardBase media-position="topLeft" :show-divider="false" content-class="content-settings">
        <template #media>
            <div class="ratio ratio-1x1 w-100 h-100 overflow-hidden d-flex align-items-center justify-content-center">
                <NuxtImg :src="props.image" placeholder :alt="props.alt" class="w-100 h-100 object-fit-cover d-block" />
            </div>
        </template>
        <template #header>
            <CardHeader class="text-left">
                <div class="d-flex flex-row justify-content-between">
                    <CardTitle :rank="5" class="ps-3 m-0 mt-2">{{ name }} <i class="bi bi-pencil-square"></i></CardTitle>
                    <CardTags class="mt-2" :items="items"/>
                    <i class="bi bi-trash3-fill me-3 mt-2"></i>
                </div>
                <p class="ps-3 small">{{ amount }} {{ unit }}</p>
            </CardHeader>
        </template>
        <template #body>
            <div class="mb-2 px-3 d-flex justify-content-between">
                <p>Lejár: {{ expiry }}</p>
            </div>
        </template>
    </CardBase>
</template>
<style scoped>
.card--base {
    max-width: 420px;
    height:auto;
}

.card--title {
    text-align: start !important;
}

i {
    padding-left: 0.25vw;
}

i:hover {
    cursor: pointer;
}
</style>