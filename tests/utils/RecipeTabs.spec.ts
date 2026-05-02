import { describe, test, expect } from 'vitest'
import { getTabRecipes } from '~/stores/recipeFilters/recipeTabs'

describe('Recept típusok tesztelése store függvényekkel', () => {
    const recipes = [
        {
            id: 1,
            name: 'Palacsinta',
            description: 'Édes tészta',
            time: 20,
            author_id: 'user-123',
            public: true,
            categories: [],
            allergies: [],
            ingredients: []
        },
        {
            id: 3,
            name: 'Saláta',
            description: 'Könnyű étel',
            time: 10,
            author_id: null,
            public: true,
            categories: [],
            allergies: [],
            ingredients: []
        }
    ]

    test('saját recepteket szűr tab alapján', () => {
        const result = getTabRecipes(recipes, 'own', 'user-123');

        expect(result.length).toBe(1);
        expect(result[0]!.name).toBe('Palacsinta');
    })


    test('alapértelmezett receptnél tartalmaz szerző nélküli receptet', () => {
        const result = getTabRecipes(recipes, 'default')

        const recipe = result.find(r => r.author_id === null)

        expect(recipe!.author_id).toBeNull()
    })

    test('alapértelmezett receptnél csak public recepteket ad vissza', () => {
        const result = getTabRecipes(recipes, 'default')

        expect(result.every(r => r.public)).toBe(true)
    })


    test('bejelentkezés nélkül az own tab üres', () => {
        const result = getTabRecipes(recipes, 'own', undefined);

        expect(result.length).toBe(0);
    })
})