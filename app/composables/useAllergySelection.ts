import type { Database } from '~/types/database.types'

type AllergyRow = Database['public']['Tables']['allergy']['Row']

type UseAllergySelectionOptions = {
    allAllergies: Ref<AllergyRow[]>
    userAllergies: Ref<AllergyRow[]>
    selectedAllergies: Ref<AllergyRow[]>
}

export const useAllergySelection = ({
    allAllergies,
    userAllergies,
    selectedAllergies
}: UseAllergySelectionOptions) => {
    const sortAllergies = (items: AllergyRow[]) => {
        return [...items].sort((a, b) => a.name.localeCompare(b.name, 'hu'))
    }

    const clearSelectedAllergies = () => {
        selectedAllergies.value = []
    }

    const getFilteredAllergies = (searchTerm: string) => {
        const trimmedSearchTerm = searchTerm.trim().toLowerCase()

        if (!trimmedSearchTerm) {
            return []
        }

        const usedIds = new Set([
            ...userAllergies.value.map(item => item.id),
            ...selectedAllergies.value.map(item => item.id)
        ])

        return allAllergies.value
            .filter(item => item.name.toLowerCase().includes(trimmedSearchTerm) && !usedIds.has(item.id))
            .slice(0, 8)
    }

    const addSelectedAllergy = (allergy: AllergyRow) => {
        const alreadyExists = userAllergies.value.some(item => item.id === allergy.id)
            || selectedAllergies.value.some(item => item.id === allergy.id)

        if (alreadyExists) {
            return false
        }

        selectedAllergies.value = sortAllergies([
            ...selectedAllergies.value,
            allergy
        ])

        return true
    }

    const removeSelectedAllergy = (allergyId: number) => {
        selectedAllergies.value = selectedAllergies.value.filter(item => item.id !== allergyId)
    }

    return {
        sortAllergies,
        clearSelectedAllergies,
        getFilteredAllergies,
        addSelectedAllergy,
        removeSelectedAllergy
    }
}
