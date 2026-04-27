import { computed, type Ref } from "vue"

export const LIMITS = {
    nameMax: 60,
    descMax: 200,
    timeMin: 2,
    timeMax: 360,
    servingsMin: 1,
    servingsMax: 20,
    ingredientsMin: 2,
    ingredientsMax: 30,
    stepsMin: 2,
    stepsMax: 30,
    stepMinChars: 10,
    stepMaxChars: 200
} as const

const NAME_CHARS = /^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s,]+$/
const DESC_CHARS = /^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ0-9\s.,!?\-:;()'"/]+$/
const HAS_LETTER = /[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ]/

export const isNameValid = (text: string): boolean =>
    !text.trim() || NAME_CHARS.test(text)

export const isDescValid = (text: string): boolean =>
    !text.trim() || DESC_CHARS.test(text)

export const isStepValid = (text: string): boolean => {
    const t = text.trim()
    return t.length >= LIMITS.stepMinChars && t.length <= LIMITS.stepMaxChars && HAS_LETTER.test(t)
}

type RecipeForm = {
    name: string
    description: string
    prepTime: number
    servings: number
    ingredients: any[]
    instructions: string[]
}

export const useRecipeValidation = (recipe: Ref<RecipeForm>) => {

    const nameLength = computed(() => recipe.value.name.length)
    const descLength = computed(() => recipe.value.description.length)
    const ingredientCount = computed(() => recipe.value.ingredients.length)
    const stepCount = computed(() => recipe.value.instructions.length)

    const nameEmpty = computed(() => !recipe.value.name.trim())
    const nameTooLong = computed(() => nameLength.value > LIMITS.nameMax)
    const nameBadChars = computed(() => !nameEmpty.value && !isNameValid(recipe.value.name))
    const nameOk = computed(() => !nameEmpty.value && !nameTooLong.value && !nameBadChars.value)

    const descEmpty = computed(() => !recipe.value.description.trim())
    const descTooLong = computed(() => nameLength.value > LIMITS.descMax)
    const descBadChars = computed(() => !descEmpty.value && !isDescValid(recipe.value.description))
    const descOk = computed(() => !descEmpty.value && !descTooLong.value && !descBadChars.value)

    const timeVal = computed(() => Number(recipe.value.prepTime))
    const timeBad = computed(() => {
        const time = timeVal.value
        return !Number.isInteger(time) || !Number.isInteger(time) || time < LIMITS.timeMin || time > LIMITS.timeMax
    })

    const servingsVal = computed(() => Number(recipe.value.servings))
    const servingsBad = computed(() => {
        const servings = servingsVal.value
        return !Number.isFinite(servings) || !Number.isInteger(servings) || servings < LIMITS.servingsMin || servings > LIMITS.servingsMax
    })

    const tooFewIngredients = computed(() => ingredientCount.value < LIMITS.ingredientsMin)
    const tooManyIngredients = computed(() => ingredientCount.value >= LIMITS.ingredientsMax)
    
    const tooFewSteps = computed(() => stepCount.value < LIMITS.stepsMin)
    const tooManySteps = computed(() => stepCount.value >= LIMITS.stepsMax)

    const isFormValid = computed(() =>
        nameOk.value && descOk.value && !timeBad.value && !servingsBad.value && !tooFewIngredients.value && !tooFewSteps.value
    )

    return {nameLength, descLength, ingredientCount, stepCount, nameEmpty, nameTooLong, nameBadChars, nameOk,
        descEmpty, descTooLong, descBadChars, descOk, timeBad, servingsBad,
        tooFewIngredients, tooManyIngredients, tooFewSteps, tooManySteps, isFormValid
    }
}