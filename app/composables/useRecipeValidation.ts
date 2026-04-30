import { computed, type Ref } from "vue"

export const LIMITS = {
    nameMax: 60,
    descMax: 300,
    timeMin: 2,
    timeMax: 360,
    servingsMin: 1,
    servingsMax: 20,
    ingredientsMin: 2,
    ingredientsMax: 50,
    stepsMin: 2,
    stepsMax: 30,
    stepMinChars: 10,
    stepMaxChars: 200
} as const

const NAME_CHARS = /^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s,-]+$/
const DESC_CHARS = /^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ0-9\s.,!?\-:;()'"/]+$/
const HAS_LETTER = /[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ]/

type RecipeForm = {
    name: string
    description: string
    prepTime: number
    servings: number
    ingredients: { ingredient_id: number; name: string; quantity: number; unit: string }[]
    instructions: string[]
}

export const useRecipeValidation = (recipe: Ref<RecipeForm>) => {

    const validateName = (name: string) => {
        const trimmed = name.trim()
        if (!trimmed) return 'recipe.validation.name.required'
        if (!NAME_CHARS.test(name)) return 'recipe.validation.name.invalidChars'
        if (name.length > LIMITS.nameMax) return 'recipe.validation.name.tooLong'
        return null
    }

    const validateDescription = (description: string) => {
        const trimmed = description.trim()
        if (!trimmed) return 'recipe.validation.desc.required'
        if (!DESC_CHARS.test(description)) return 'recipe.validation.desc.invalidChars'
        if (description.length > LIMITS.descMax) return 'recipe.validation.desc.tooLong'
        return null
    }

    const validatePrepTime = (time: number) => {
        const v = Number(time)
        if (!Number.isFinite(v) || !Number.isInteger(v)) return 'recipe.validation.time.notNumber'
        if (v < LIMITS.timeMin || v > LIMITS.timeMax) return 'recipe.validation.time.range'
        return null
    }

    const validateServings = (servings: number) => {
        const v = Number(servings)
        if (!Number.isFinite(v) || !Number.isInteger(v)) return 'recipe.validation.servings.notNumber'
        if (v < LIMITS.servingsMin || v > LIMITS.servingsMax) return 'recipe.validation.servings.range'
        return null
    }

    const validateIngredientCount = (count: number) => {
        if (count < LIMITS.ingredientsMin) return 'recipe.validation.ingredients.tooFew'
        return null
    }

    const validateStepCount = (count: number) => {
        if (count < LIMITS.stepsMin) return 'recipe.validation.steps.tooFew'
        return null
    }

    const validateStepText = (text: string) => {
        const trimmed = text.trim()
        if (!trimmed) return null
        if (trimmed.length < LIMITS.stepMinChars) return 'recipe.validation.step.tooShort'
        if (trimmed.length > LIMITS.stepMaxChars) return 'recipe.validation.step.tooLong'
        if (!HAS_LETTER.test(trimmed)) return 'recipe.validation.step.needsLetter'
        return null
    }

    const isStepValid = (text: string) => {
        const trimmed = text.trim()
        return trimmed.length >= LIMITS.stepMinChars
            && trimmed.length <= LIMITS.stepMaxChars
            && HAS_LETTER.test(trimmed)
    }

    const nameLength = computed(() => recipe.value.name.length)
    const descLength = computed(() => recipe.value.description.length)
    const ingredientCount = computed(() => recipe.value.ingredients.length)
    const stepCount = computed(() => recipe.value.instructions.length)

    const nameEmpty = computed(() => !recipe.value.name.trim())
    const nameTooLong = computed(() => nameLength.value > LIMITS.nameMax)
    const nameBadChars = computed(() => !nameEmpty.value && !NAME_CHARS.test(recipe.value.name))
    const nameOk = computed(() => !nameEmpty.value && !nameTooLong.value && !nameBadChars.value)

    const descEmpty = computed(() => !recipe.value.description.trim())
    const descTooLong = computed(() => descLength.value > LIMITS.descMax)
    const descBadChars = computed(() => !descEmpty.value && !DESC_CHARS.test(recipe.value.description))
    const descOk = computed(() => !descEmpty.value && !descTooLong.value && !descBadChars.value)

    const timeBad = computed(() => !!validatePrepTime(Number(recipe.value.prepTime)))
    const servingsBad = computed(() => !!validateServings(Number(recipe.value.servings)))

    const tooFewIngredients = computed(() => ingredientCount.value < LIMITS.ingredientsMin)
    const tooManyIngredients = computed(() => ingredientCount.value >= LIMITS.ingredientsMax)
    const tooFewSteps = computed(() => stepCount.value < LIMITS.stepsMin)
    const tooManySteps = computed(() => stepCount.value >= LIMITS.stepsMax)

    const isFormValid = computed(() =>
        nameOk.value && descOk.value && !timeBad.value && !servingsBad.value && !tooFewIngredients.value && !tooFewSteps.value
    )

    const firstError = computed(() =>
        validateName(recipe.value.name) || validateDescription(recipe.value.description) ||
        validatePrepTime(Number(recipe.value.prepTime)) || validateServings(Number(recipe.value.servings)) ||
        validateIngredientCount(ingredientCount.value) || validateStepCount(stepCount.value)
    )

    return {validateName, validateDescription, validatePrepTime, validateServings, 
        validateIngredientCount, validateStepCount, validateStepText, isStepValid,
        nameLength, descLength, ingredientCount, stepCount, nameEmpty, nameTooLong, nameBadChars, nameOk,
        descEmpty, descTooLong, descBadChars, descOk, timeBad, servingsBad,
        tooFewIngredients, tooManyIngredients, tooFewSteps, tooManySteps, isFormValid, firstError
    }
}