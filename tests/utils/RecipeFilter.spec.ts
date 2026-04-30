import { describe, test, expect } from 'vitest'
import { getFilteredRecipes } from '~/stores/recipeFilters/recipeFilters'
import { getTabRecipes } from '~/stores/recipeFilters/recipeTabs'

describe('Recept szűrés – store függvényekkel', () => {
    const recipes = [
        {
            id: 1,
            name: 'Gulyásleves',
            description: 'Finom magyar leves',
            time: 90,
            author_id: null,
            public: true,
            categories: [],
            allergies: [],
            ingredients: []
        },
        {
            id: 2,
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

    test('név alapján szűr a store filter', () => {
        const result = getFilteredRecipes(recipes, 'gulyás', null, null, null, false, [])

        expect(result).toHaveLength(1)
        expect(result[0]!.name).toBe('Gulyásleves')
    })

    test('időtartam alapján szűr a store filter', () => {
        const result = getFilteredRecipes(recipes, '', 'under30', null, null, false, [])

        expect(result).toHaveLength(2)
        expect(result.map(r => r.name)).toEqual(['Palacsinta', 'Saláta'])
    })

    test('saját recepteket szűr tab alapján', () => {
        const result = getTabRecipes(recipes, 'own', 'user-123')

        expect(result).toHaveLength(1)
        expect(result[0]!.name).toBe('Palacsinta')
    })
})