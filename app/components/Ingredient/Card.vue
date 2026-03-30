<script setup lang="ts">
import type { CardTagItem } from '~/interfaces/cardInterfaces/CardGenericInterfaces';
import ExpiryDate from '~/models/ExpiryDate';
import Ingredient from '~/models/Ingredient';
import { useIngredientStore } from '~/stores/ingredients';
const ingredientState = useIngredientStore();
const card = useTemplateRef("card")
const {width: cardWidth} = useElementBounding(card)
const isSmall = computed(() =>  cardWidth.value <= 395 )
const showDescription = ref<boolean>(false)

const editing = ref(false);

const props = withDefaults(defineProps<{
    ingredient: Ingredient,
    image?: string,
    alt?: string
}>(),
    {
       image: "images/background.webp",
       alt: "here" 
    });

const prevId = props.ingredient.id

const items = computed(() => {
    const tag = props.ingredient.tag
    const variant = tag === 'Friss'
        ? 'active' : tag === "Hamarosan Lejár"
        ? 'outline' : "custom" 
    return [{label: tag, variant: variant} as CardTagItem]
})  

const toggleDescription = () => {
    showDescription.value = !showDescription.value;
    return;
}

const updateExpiry = (val: {target: {value: string}}) => {
    props.ingredient.expiry = new ExpiryDate(new Date(val.target.value));
}

const onEdit = async () =>{
    await $fetch("/api/ingredient", {
        method:"PUT",
        body: {
            prev: prevId,
            name: props.ingredient.name,
            quantity: props.ingredient.quantity,
            expiry: props.ingredient.expiry.toStamp(),
            unit: props.ingredient.unit,
        }
    })
}

</script>
<template>
    <CardBase media-position="topLeft" :show-divider="false" content-class="content-settings" ref="card" :class="{'card-fixed': !showDescription}" v-if="!editing">
        <template #media>
            <div class="ratio ratio-1x1 w-100 h-100 overflow-hidden d-flex align-items-center justify-content-center">
                <NuxtImg :src="props.image" placeholder :alt="props.alt" class="w-100 h-100 object-fit-cover d-block" />
            </div>
        </template>
        <template #header>
            <CardHeader class="text-left">
                <div class="d-flex flex-row justify-content-start">
                    <CardTitle :rank="5" class="ps-3 m-0 align-self-center">{{ ingredient.name }} <i class="bi bi-pencil-square" v-if="!isSmall" @click="editing = true"></i></CardTitle>
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
                    <p class="pb-1" @click="editing = true">Szerkesztés</p>
                    <p @click="$emit('delete', ingredient)">Törlés</p>
                </div>
            </div>
        </template>
    </CardBase>
    <CardBase media-position="topLeft" :show-divider="false" content-class="content-settings" ref="card" v-else>
        <template #media>
            <div class="ratio ratio-1x1 w-100 h-100 overflow-hidden d-flex align-items-center justify-content-center">
                <NuxtImg :src="props.image" placeholder :alt="props.alt" class="w-100 h-100 object-fit-cover d-block" />
            </div>
        </template>
        <template #body>
            <div class="text-left mx-3 mt-2">
                <div class="d-flex flex-row justify-content-between">
                    <input type="text" v-model="ingredient.name" class="ps-3 m-0 mb-2 align-self-center">
                    <button type="button" class="btn-close" aria-label="Close" @click="editing = false"></button>
                </div>
                <CardTags class="mb-2 ms-2" :items="items" v-if="isSmall"/>
                <div class="d-flex flex-column">
                    <div class="mb-2">
                        <input type="number" class="me-2 ps-3 text-align-right small quantityInput" v-model="ingredient.quantity">
                        <select v-model="ingredient.unit" name="unit">
                            <option :value="unit" v-for="unit in ingredientState.units" class="w-50">{{ unit }}</option>
                        </select>
                    </div>
                    <input type="date" class="border-bottom-3" @change="updateExpiry">
                    <button type="button" class="btn btn-success my-2" @click="onEdit">Mentés</button>
                </div>
            </div>
        </template>
    </CardBase>

</template>
<style scoped>

.quantityInput {
    width: auto;
    min-width: 20px;
    max-width: 40%;
}

input {
    border: none;
    border-bottom: dotted 1px black
}

input:focus-visible {
    outline: none;
}

select {
    min-width: 40px !important;
}

option {
    color: #000;
}
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