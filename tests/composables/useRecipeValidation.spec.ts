import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { LIMITS, useRecipeValidation } from '~/composables/useRecipeValidation'

const createValidRecipe = () => ref({
    name: 'Palacsinta',
    description: 'Egyszerű, gyorsan elkészíthető recept.',
    prepTime: 30,
    servings: 2,
    ingredients: [
        { ingredient_id: 1, name: 'Liszt', quantity: 20, unit: 'dkg' },
        { ingredient_id: 2, name: 'Tej', quantity: 2, unit: 'dl' }
    ],
    instructions: [
        'Keverd össze az alapanyagokat.',
        'Süsd ki a palacsintákat.'
    ]
})

describe('Recept validáció', () => {
    const recipe = createValidRecipe();
    const validation = useRecipeValidation(recipe);

    describe('név ellenőrzése', () => {
        test('elfogadja a helyes nevet', () => {
            expect(validation.validateName('Palacsinta')).toBeNull()
        })

        test('hibát ad üres névnél', () => {
            expect(validation.validateName('')).toBe('recipe.validation.name.required')
        })

        test('hibát ad túl hosszú névnél', () => {
            const longName = 'a'.repeat(LIMITS.nameMax + 1);
            expect(validation.validateName(longName)).toBe('recipe.validation.name.tooLong')
        })
    })

    describe('leírás ellenőrzése', () => {
        test('elfogadja a helyes leírást', () => {
            expect(validation.validateDescription('Finom házi recept.')).toBeNull()
        })

        test('hibát ad üres leírásnál', () => {
            expect(validation.validateDescription('')).toBe('recipe.validation.desc.required')
        })
    })

    describe('idő és adag ellenőrzése', () => {
        test('elfogadja a megengedett elkészítési időt', () => {
            expect(validation.validatePrepTime(30)).toBeNull()
        })

        test('hibát ad túl rövid elkészítési időnél', () => {
            expect(validation.validatePrepTime(LIMITS.timeMin - 1)).toBe('recipe.validation.time.range')
        })


        test('elfogadja a helyes adagszámot', () => {
            expect(validation.validateServings(2)).toBeNull()
        })

        test('hibát ad túl nagy adagszámnál', () => {
            expect(validation.validateServings(LIMITS.servingsMax + 1)).toBe('recipe.validation.servings.range')
        })
    })

    describe('hozzávalók és lépések ellenőrzése', () => {
        test('hibát ad kevés hozzávalónál', () => {
            expect(validation.validateIngredientCount(1)).toBe('recipe.validation.ingredients.tooFew')
        })

        test('hibát ad kevés lépésnél', () => {
            expect(validation.validateStepCount(1)).toBe('recipe.validation.steps.tooFew');
        })

        test('elfogadja a megfelelő hosszúságú lépést', () => {
            expect(validation.isStepValid('Ez egy megfelelő hosszúságú lépés.')).toBe(true);
        })

        test('hibát ad túl rövid lépésnél', () => {
            expect(validation.validateStepText('Rövid')).toBe('recipe.validation.step.tooShort');
        })
    })

    describe('teljes űrlap ellenőrzése', () => {
        test('helyes receptnél érvényes az űrlap', () => {
            expect(validation.isFormValid.value).toBe(true);
            expect(validation.firstError.value).toBeNull();
        })

        test('hiányos receptnél nem érvényes az űrlap', () => {
            recipe.value.name = '';

            expect(validation.isFormValid.value).toBe(false);
            expect(validation.firstError.value).toBe('recipe.validation.name.required');
        })
    })
})
