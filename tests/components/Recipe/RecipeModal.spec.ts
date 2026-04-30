import { ref } from "vue"

describe('Recept modal – hozzávalók kezelése', () => {
    type Ingredient = {
        ingredient_id: number
        name: string
        quantity: number
        unit: string
    }

    test('Hozzávaló hozzáadása', () => {
        const ingredients = ref<Ingredient[]>([])

        ingredients.value.push({
            ingredient_id: 1,
            name: 'Liszt',
            quantity: 500,
            unit: 'g'
        })

        expect(ingredients.value).toHaveLength(1)
        expect(ingredients.value[0]!.name).toBe('Liszt')
    })

    test('Azonos hozzávaló azonos mértékegységgel összevonódik', () => {
        const ingredients = ref<Ingredient[]>([])

        function addIngredient(item: Ingredient) {
            const existing = ingredients.value.find(
                i => i.ingredient_id === item.ingredient_id && i.unit === item.unit
            )

            if (existing) {
                existing.quantity = Math.round((existing.quantity + item.quantity) * 1000) / 1000
            } else {
                ingredients.value.push({ ...item })
            }
        }

        addIngredient({ ingredient_id: 1, name: 'Liszt', quantity: 200, unit: 'g' })
        addIngredient({ ingredient_id: 1, name: 'Liszt', quantity: 300, unit: 'g' })

        expect(ingredients.value).toHaveLength(1)
        expect(ingredients.value[0]!.quantity).toBe(500)
    })

    test('Azonos hozzávaló eltérő mértékegységgel külön marad', () => {
        const ingredients = ref<Ingredient[]>([])

        ingredients.value.push({ ingredient_id: 1, name: 'Tej', quantity: 2, unit: 'dl' })
        ingredients.value.push({ ingredient_id: 1, name: 'Tej', quantity: 500, unit: 'ml' })

        expect(ingredients.value).toHaveLength(2)
    })

    test('Hozzávaló törlése', () => {
        const ingredients = ref<Ingredient[]>([
            { ingredient_id: 1, name: 'Liszt', quantity: 500, unit: 'g' },
            { ingredient_id: 2, name: 'Cukor', quantity: 100, unit: 'g' }
        ])

        ingredients.value.splice(0, 1)

        expect(ingredients.value).toHaveLength(1)
        expect(ingredients.value[0]!.name).toBe('Cukor')
    })

    test('Hozzávaló szerkesztése', () => {
        const ingredients = ref<Ingredient[]>([
            { ingredient_id: 1, name: 'Liszt', quantity: 500, unit: 'g' }
        ])

        Object.assign(ingredients.value[0]!, { quantity: 750 })
        expect(ingredients.value[0]!.quantity).toBe(750)
    })

    test('Lebegőpontos mennyiség kerekítése', () => {
        const ingredients = ref<Ingredient[]>([
            { ingredient_id: 1, name: 'Olaj', quantity: 0.1, unit: 'dl' }
        ])

        ingredients.value[0]!.quantity =
            Math.round((ingredients.value[0]!.quantity + 0.2) * 1000) / 1000

        expect(ingredients.value[0]!.quantity).toBe(0.3)
    })
})