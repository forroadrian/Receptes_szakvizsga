<script setup lang="ts">
import type { CardTagItem } from '~/interfaces/cardInterfaces/CardGenericInterfaces';
import ExpiryDate from '~/models/ExpiryDate';
import Ingredient from '~/models/Ingredient';
import { useIngredientStore } from '~/stores/ingredients';

const ingredientState = useIngredientStore();
const card = useTemplateRef("card")
const { width: cardWidth } = useElementBounding(card)
const isTiny = computed(() => cardWidth.value <= 370)

const editing = ref(false)

const props = defineProps<{
    ingredient: Ingredient,
}>()

const prevId = props.ingredient.id

const items = computed(() => {
    const tag = props.ingredient.tag
    const variant = tag === 'Friss' ? 'active' : tag === "Hamarosan" ? 'warning' : "custom"
    return [{ label: tag, variant: variant } as CardTagItem]
})

const freshnessConfig = computed(() => {
    switch (props.ingredient.tag) {
        case 'Friss':
            return { icon: 'bi bi-leaf', colorClass: 'freshness--fresh' }
        case 'Hamarosan':
            return { icon: 'bi bi-clock-history', colorClass: 'freshness--warning' }
        default:
            return { icon: 'bi bi-exclamation-triangle', colorClass: 'freshness--expired' }
    }
})

const editName = ref(props.ingredient.name)
const editQuantity = ref(props.ingredient.quantity)
const editUnit = ref(props.ingredient.unit)
const editExpiry = ref(props.ingredient.expiry.toShort())
const nameInputOpen = ref(false)
const confirmingDelete = ref(false)

const originalName = ref('')
const originalQuantity = ref(0)
const originalUnit = ref('')
const originalExpiry = ref('')

const isCached = computed(() =>
    editName.value === originalName.value &&
    editQuantity.value === originalQuantity.value &&
    editUnit.value === originalUnit.value &&
    editExpiry.value === originalExpiry.value
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
    editName.value = props.ingredient.name
    editQuantity.value = props.ingredient.quantity
    editUnit.value = props.ingredient.unit
    editExpiry.value = props.ingredient.expiry.toShort()
    originalName.value = props.ingredient.name
    originalQuantity.value = props.ingredient.quantity
    originalUnit.value = props.ingredient.unit
    originalExpiry.value = props.ingredient.expiry.toShort()
    nameInputOpen.value = false
    editing.value = true
    ingredientState.loadAvailableIngredients()
}

function cancelEditing() {
    editing.value = false
}

function requestDelete() {
    confirmingDelete.value = true
    setTimeout(() => { confirmingDelete.value = false }, 3000)
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
            quantity: editQuantity.value,
            expiry: new ExpiryDate(new Date(editExpiry.value)).toStamp(),
            unit: editUnit.value,
        }
    })
    props.ingredient.name = editName.value
    props.ingredient.quantity = editQuantity.value
    props.ingredient.unit = editUnit.value
    props.ingredient.expiry = new ExpiryDate(new Date(editExpiry.value))
    editing.value = false
}
</script>

<template>
    <CardBase :show-divider="false" content-class="content-settings" ref="card"
        :class="['card--ingredient', 'card--pantry', freshnessConfig.colorClass, { 'card--tiny': isTiny, 'card--editing': editing }]">
        <template #header>
            <CardHeader class="text-left pantry-header">
                <div class="pantry-top-row">
                    <div class="pantry-name-row">
                        <CardTitle :rank="5" class="m-0 pantry-name">{{ ingredient.name }}</CardTitle>
                        <button class="card-action-btn card-action-btn--edit card-action--inline"
                            @click="editing ? cancelEditing() : startEditing()"
                            :title="editing ? 'Mégse' : 'Szerkesztés'">
                            <i :class="editing ? 'bi bi-x-lg' : 'bi bi-pencil'"></i>
                        </button>
                    </div>
                    <span class="pantry-tag" :class="freshnessConfig.colorClass">{{ ingredient.tag }}</span>
                </div>
                <span v-if="!editing" class="pantry-qty">{{ ingredient.quantity }} {{ ingredient.unit }}</span>
            </CardHeader>
        </template>
        <template #body>
            <div v-if="editing" class="card-edit-drawer">
                <div class="position-relative">
                    <span class="card-edit-label">Alapanyag</span>
                    <div class="card-edit-input card-edit-input--trigger" :class="{ open: nameInputOpen }"
                        v-if="!nameInputOpen" @click="nameInputOpen = true">
                        <span :class="editName ? '' : 'card-edit-placeholder'">{{ editName || 'Keresés…' }}</span>
                        <i class="bi bi-chevron-down ms-auto"></i>
                    </div>
                    <input v-else v-model="editName" type="text" class="card-edit-input" placeholder="Keresés…"
                        autocomplete="off" @blur="onEditNameBlur" />
                    <ul v-if="nameInputOpen" class="card-edit-dropdown list-group position-absolute w-100">
                        <li v-for="item in filteredEditIngredients" :key="item.id"
                            class="list-group-item list-group-item-action"
                            @mousedown.prevent="selectEditIngredient(item.name)">
                            {{ item.name }}
                        </li>
                    </ul>
                </div>

                <div class="card-edit-row">
                    <div class="card-edit-field">
                        <span class="card-edit-label">Mennyiség</span>
                        <input type="number" class="card-edit-input" v-model="editQuantity" min="0" />
                    </div>
                    <div class="card-edit-field card-edit-field--unit">
                        <span class="card-edit-label">Egység</span>
                        <select class="card-edit-input" v-model="editUnit">
                            <option :value="unit" v-for="unit in ingredientState.units">{{ unit }}</option>
                        </select>
                    </div>
                    <div class="card-edit-field">
                        <span class="card-edit-label">Lejárat</span>
                        <input type="date" class="card-edit-input" v-model="editExpiry" />
                    </div>
                </div>

                <div class="card-edit-actions">
                    <button type="button" class="card-edit-btn card-edit-btn--cancel"
                        @click="cancelEditing">Mégse</button>
                    <button type="button" class="card-edit-btn card-edit-btn--save" :disabled="!editNameIsValid"
                        @click="onEdit">
                        <i class="bi bi-check2"></i> Mentés
                    </button>
                </div>
            </div>
        </template>
        <template #footer>
            <div v-if="!editing" class="pantry-footer">
                <span class="pantry-date">Lejár: {{ ingredient.expiry.toShort() }}</span>
                <button v-if="!confirmingDelete" class="card-action-btn card-action-btn--delete card-action--corner"
                    @click="requestDelete" title="Törlés">
                    <i class="bi bi-trash3"></i>
                </button>
                <button v-else class="card-action-btn card-action-btn--confirm card-action--corner"
                    @click="confirmingDelete = false; $emit('delete', ingredient)" title="Megerősítés">
                    Biztos?
                </button>
            </div>
        </template>
    </CardBase>
</template>

<style scoped>
@import '~/assets/css/ingredientCard.css';
</style>
