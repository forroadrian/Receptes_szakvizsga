import type { Database } from '~/types/database.types'

type IngredientRow = Database['public']['Tables']['ingredient']['Row']

type UseDislikedIngredientSelectionOptions = {
    allIngredients: Ref<IngredientRow[]>
    userDislikedIngredients: Ref<IngredientRow[]>
    selectedDislikedIngredients: Ref<IngredientRow[]>
}

export const useDislikedIngredientSelection = ({
    allIngredients,
    userDislikedIngredients,
    selectedDislikedIngredients
}: UseDislikedIngredientSelectionOptions) => {
    const sortIngredients = (items: IngredientRow[]) => {
        return [...items].sort((a, b) => a.name.localeCompare(b.name, 'hu'))
    }

    const clearSelectedDislikedIngredients = () => {
        selectedDislikedIngredients.value = []
    }

    const getFilteredDislikedIngredients = (searchTerm: string) => {
        const trimmedSearchTerm = searchTerm.trim().toLowerCase()

        if (!trimmedSearchTerm) {
            return []
        }

        const usedIds = new Set([
            ...userDislikedIngredients.value.map(item => item.id),
            ...selectedDislikedIngredients.value.map(item => item.id)
        ])

        return allIngredients.value
            .filter(item => item.name.toLowerCase().includes(trimmedSearchTerm) && !usedIds.has(item.id))
            .slice(0, 8)
    }

    const addSelectedDislikedIngredient = (ingredient: IngredientRow) => {
        const alreadyExists = userDislikedIngredients.value.some(item => item.id === ingredient.id)
            || selectedDislikedIngredients.value.some(item => item.id === ingredient.id)

        if (alreadyExists) {
            return false
        }

        selectedDislikedIngredients.value = sortIngredients([
            ...selectedDislikedIngredients.value,
            ingredient
        ])

        return true
    }

    const removeSelectedDislikedIngredient = (ingredientId: number) => {
        selectedDislikedIngredients.value = selectedDislikedIngredients.value.filter(item => item.id !== ingredientId)
    }

    return {
        sortIngredients,
        clearSelectedDislikedIngredients,
        getFilteredDislikedIngredients,
        addSelectedDislikedIngredient,
        removeSelectedDislikedIngredient
    }
}