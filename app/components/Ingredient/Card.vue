<script setup lang="ts">
import type { CardTagItem } from '~/interfaces/cardInterfaces/CardGenericInterfaces';
import ExpiryDate from '~/models/ExpiryDate';
import Ingredient from '~/models/Ingredient';
import { useIngredientStore } from '~/stores/ingredients';

const ingredientState = useIngredientStore();
const card = useTemplateRef("card")
const { width: cardWidth } = useElementBounding(card)
const isTiny  = computed(() => cardWidth.value <= 370)

const editing = ref(false)

const props = withDefaults(defineProps<{
    ingredient: Ingredient,
    image?: string,
    alt?: string
}>(), {
    image: "images/background.webp",
    alt: "here"
})

const prevId = props.ingredient.id

const items = computed(() => {
    const tag = props.ingredient.tag
    const variant = tag === 'Friss' ? 'active' : tag === "Hamarosan" ? 'warning' : "custom"
    return [{ label: tag, variant: variant } as CardTagItem]
})

const editName       = ref(props.ingredient.name)
const nameInputOpen  = ref(false)

const originalName     = ref('')
const originalQuantity = ref(0)
const originalUnit     = ref('')
const originalExpiry   = ref('')

const isCached = computed(() =>
    editName.value            === originalName.value     &&
    props.ingredient.quantity === originalQuantity.value &&
    props.ingredient.unit     === originalUnit.value     &&
    props.ingredient.expiry.toShort() === originalExpiry.value
)

const filteredEditIngredients = computed(() => {
    const q = editName.value.toLowerCase()
    if (!q) return ingredientState.availableIngredients.slice(0, 10)
    return ingredientState.availableIngredients
        .filter(i => i.name.toLowerCase().includes(q))
        .slice(0, 10)
})

const editNameIsValid = computed(() =>
    ingredientState.availableIngredients.some(i => i.name === editName.value)
)

function selectEditIngredient(name: string) {
    editName.value = name
    nameInputOpen.value = false
}

function onEditNameBlur() {
    nameInputOpen.value = false
    if (!editNameIsValid.value) editName.value = props.ingredient.name
}

function startEditing() {
    editName.value       = props.ingredient.name
    originalName.value     = props.ingredient.name
    originalQuantity.value = props.ingredient.quantity
    originalUnit.value     = props.ingredient.unit
    originalExpiry.value   = props.ingredient.expiry.toShort()
    nameInputOpen.value  = false
    editing.value        = true
    ingredientState.loadAvailableIngredients()
}

const updateExpiry = (val: { target: { value: string } }) => {
    props.ingredient.expiry = new ExpiryDate(new Date(val.target.value))
}

const onEdit = async () => {
    if (!editNameIsValid.value) return
    if (isCached.value) {
        editing.value = false
        return
    }
    await $fetch("/api/ingredient", {
        method: "PUT",
        body: {
            prev: prevId,
            name: editName.value,
            quantity: props.ingredient.quantity,
            expiry: props.ingredient.expiry.toStamp(),
            unit: props.ingredient.unit,
        }
    })
    props.ingredient.name = editName.value
    editing.value = false
}
</script>

<template>
    <CardBase
        media-position="topLeft"
        :show-divider="false"
        content-class="content-settings"
        ref="card"
        :class="{ 'card--tiny': isTiny }"
        :media-left-class="isTiny ? 'media-tiny' : ''"
        v-if="!editing"
    >
        <template #media>
            <div class="ratio ratio-1x1 w-100 h-100 overflow-hidden d-flex align-items-center justify-content-center">
                <NuxtImg :src="props.image" placeholder :alt="props.alt" class="w-100 h-100 object-fit-cover d-block" />
            </div>
        </template>
        <template #header>
            <CardHeader class="text-left">
                <div class="d-flex flex-row align-items-center">
                    <CardTitle :rank="5" class="ps-3 m-0">{{ ingredient.name }}</CardTitle>
                    <CardTags class="ms-2 flex-shrink-0" :items="items" />
                </div>
                <p class="ps-3 mb-0 small text-muted">{{ ingredient.quantity }} {{ ingredient.unit }}</p>
            </CardHeader>
        </template>
        <template #body>
            <div class="px-3 pb-2 d-flex flex-row align-items-center justify-content-between">
                <p class="m-0 small text-muted">Lejár: {{ ingredient.expiry.toShort() }}</p>
                <div class="d-flex gap-2">
                    <button class="card-action-btn card-action-btn--edit" @click="startEditing" title="Szerkesztés">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="card-action-btn card-action-btn--delete" @click="$emit('delete', ingredient)" title="Törlés">
                        <i class="bi bi-trash3"></i>
                    </button>
                </div>
            </div>
        </template>
    </CardBase>

    <CardBase
        media-position="topLeft"
        :show-divider="false"
        content-class="content-settings"
        ref="card"
        :class="{ 'card--tiny': isTiny }"
        :media-left-class="isTiny ? 'media-tiny' : ''"
        v-else
    >
        <template #media>
            <div class="ratio ratio-1x1 w-100 h-100 overflow-hidden d-flex align-items-center justify-content-center">
                <NuxtImg :src="props.image" placeholder :alt="props.alt" class="w-100 h-100 object-fit-cover d-block" />
            </div>
        </template>
        <template #body>
            <div class="card-edit-form d-flex flex-column gap-2 p-2">

                <div class="position-relative">
                    <span class="card-edit-label">Alapanyag neve</span>
                    <div
                        class="card-edit-input card-edit-input--trigger"
                        :class="{ open: nameInputOpen }"
                        v-if="!nameInputOpen"
                        @click="nameInputOpen = true"
                    >
                        <span :class="editName ? '' : 'card-edit-placeholder'">{{ editName || 'Keresés…' }}</span>
                        <i class="bi bi-chevron-down ms-auto"></i>
                    </div>
                    <input
                        v-else
                        v-model="editName"
                        type="text"
                        class="card-edit-input"
                        placeholder="Keresés…"
                        autocomplete="off"
                        @blur="onEditNameBlur"
                    />
                    <ul v-if="nameInputOpen" class="card-edit-dropdown list-group position-absolute w-100">
                        <li
                            v-for="item in filteredEditIngredients"
                            :key="item.id"
                            class="list-group-item list-group-item-action"
                            @mousedown.prevent="selectEditIngredient(item.name)"
                        >
                            {{ item.name }}
                        </li>
                    </ul>
                </div>

                <div class="d-flex gap-2">
                    <div class="flex-grow-1">
                        <span class="card-edit-label">Mennyiség</span>
                        <input type="number" class="card-edit-input" v-model="ingredient.quantity" min="0" />
                    </div>
                    <div style="width: 90px">
                        <span class="card-edit-label">Egység</span>
                        <select class="card-edit-input" v-model="ingredient.unit">
                            <option :value="unit" v-for="unit in ingredientState.units">{{ unit }}</option>
                        </select>
                    </div>
                </div>

                <div>
                    <span class="card-edit-label">Lejárati dátum</span>
                    <input type="date" class="card-edit-input" :value="ingredient.expiry.toShort()" @change="updateExpiry" />
                </div>

                <div class="d-flex gap-2 mt-1">
                    <button type="button" class="card-edit-btn card-edit-btn--cancel flex-grow-1" @click="editing = false">Mégse</button>
                    <button type="button" class="card-edit-btn card-edit-btn--save flex-grow-1" :disabled="!editNameIsValid" @click="onEdit">
                        <i class="bi bi-check2"></i> Mentés
                    </button>
                </div>

            </div>
        </template>
    </CardBase>
</template>

<style scoped>
@import '~/assets/css/ingredientCard.css';
</style>
