<script setup lang="ts">
import type { CardTagItem } from '~/interfaces/cardInterfaces/CardGenericInterfaces';
import Ingredient from '~/models/Ingredient';

const card = useTemplateRef("card")
const {width: cardWidth} = useElementBounding(card)

const isSmall = computed(() =>  cardWidth.value <= 395 )

const showDescription = ref<boolean>(false)

const props = withDefaults(defineProps<{
    ingredient: Ingredient,
    image?: string,
    alt?: string
}>(),
    {
       image: "images/background.webp",
       alt: "here" 
    });

const items = computed(() => {
    const tag = props.ingredient.tag
    const variant = tag === 'Friss'
        ? 'active' : tag === "Hamarosan Lejár"
        ? 'outline' : "custom" 
    return [{label: tag, variant: variant} as CardTagItem]
})  

const toggleDescription = () => {
    showDescription.value = !showDescription.value
    return
}


</script>
<template>

    <CardBase media-position="topLeft" :show-divider="false" content-class="content-settings" ref="card" :class="{'card-fixed': !showDescription}">
        <template #media>
            <div class="ratio ratio-1x1 w-100 h-100 overflow-hidden d-flex align-items-center justify-content-center">
                <NuxtImg :src="props.image" placeholder :alt="props.alt" class="w-100 h-100 object-fit-cover d-block" />
            </div>
        </template>
        <template #header>
            <CardHeader class="text-left">
                <div class="d-flex flex-row justify-content-start">
                    <CardTitle :rank="5" class="ps-3 m-0 align-self-center">{{ ingredient.name }} <i class="bi bi-pencil-square" v-if="!isSmall" @click="$emit('edit', ingredient)"></i></CardTitle>
                    <i class="bi bi-three-dots flex-fill text-end fs-2 mt-2 me-3" @click="toggleDescription" v-if="isSmall"></i>
                    <CardTags class="mt-2 ms-3" :items="items" v-if="!isSmall"/>
                    <i class="bi bi-trash3-fill me-3 mt-2 flex-fill text-end" v-if="!isSmall" @click="$emit('delete', ingredient)"></i>
                </div>
                <CardTags class="mb-2 ms-2" :items="items" v-if="isSmall"/>
                <p class="ps-3 small">{{ ingredient.quantity }} {{ ingredient.unit }}</p>
            </CardHeader>
        </template>
        <template #body>
            <div class="mb-2 px-3 d-flex flex-column justify-content-between">
                <p class="m-0" :class="{'border-bottom mb-2': showDescription && isSmall}">Lejár: {{ ingredient.expiry.toShort() }}</p>
                <div class="d-flex flex-column flex-grow options" v-if="showDescription && isSmall">
                    <p class="pb-1" @click="$emit('edit',ingredient)">Szerkesztés</p>
                    <p @click="$emit('delete', ingredient)">Törlés</p>
                </div>
            </div>
        </template>
    </CardBase>


</template>
<style scoped>
.card--base {
    width: 100%;
    height:auto;
}

.options > p {
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    padding: 0;
    margin: 0;
    font-style: italic;
}

.options > p:active {
    transform: scale(0.95);
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.options > p:hover {
    transform: scale(1.02);
    cursor: pointer;
    
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