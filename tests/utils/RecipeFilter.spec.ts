import { describe, test, expect } from 'vitest'
import { getFilteredRecipes } from '~/stores/recipeFilters/recipeFilters'

describe('Recept szűrés tesztelése store függvényekkel', () => {
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
        const result = getFilteredRecipes(recipes, 'gulyás', null, null, null, false, []);

        expect(result.length).toBe(1);
        expect(result[0]!.name).toBe('Gulyásleves')
    })

    test('időtartam alapján szűr a store filter', () => {
        const result = getFilteredRecipes(recipes, '', 'under30', null, null, false, [])

        expect(result.length).toBe(2);
        expect(result.map(r => r.name)).toEqual(['Palacsinta', 'Saláta'])
    })


    test('szűrés nélkül minden receptet visszaad', () => {
        const result = getFilteredRecipes(recipes, '', null, null, null, false, []);

        expect(result.length).toBe(3);
    })

    test('nem létező kifejezésre nincs találat', () => {
        const result = getFilteredRecipes(recipes, 'pizza', null, null, null, false, []);

        expect(result.length).toBe(0);
    })

    test('kis- és nagybetű érzéketlen keresés', () => {
        const result = getFilteredRecipes(recipes, 'PALACSINTA', null, null, null, false, []);

        expect(result.length).toBe(1);
        expect(result[0]!.name).toBe('Palacsinta')
    })

    test('csak a 15 perc alatti receptek', () => {
        const result = getFilteredRecipes(recipes, '', 'under15', null, null, false, [])

        expect(result.length).toBe(1)
        expect(result[0]!.name).toBe('Saláta')
    })

    test('csak a 60 perc feletti receptek', () => {
        const result = getFilteredRecipes(recipes, '', 'over60', null, null, false, []);

        expect(result.length).toBe(1);
        expect(result[0]!.name).toBe('Gulyásleves');
    })

})