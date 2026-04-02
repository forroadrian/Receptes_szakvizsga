import { defineStore } from 'pinia'
import type { Database } from '~/types/database.types'

type AllergyRow = Database['public']['Tables']['allergy']['Row']

export const usePreferencesStore = defineStore('preferences', () => {
    const user = useSupabaseUser()

    const loading = ref(false)
    const saving = ref(false)
    const errorMessage = ref('')
    const currentUserId = ref('')

    const allAllergies = ref<AllergyRow[]>([])
    const userAllergies = ref<AllergyRow[]>([])
    const selectedAllergies = ref<AllergyRow[]>([])

    const clearMessages = () => {
        errorMessage.value = ''
    }

    const {
        sortAllergies,
        clearSelectedAllergies,
        getFilteredAllergies,
        addSelectedAllergy,
        removeSelectedAllergy
    } = useAllergySelection({
        allAllergies,
        userAllergies,
        selectedAllergies
    })

    const {
        clearPreferenceState,
        loadAllergies,
        loadUserAllergies,
        loadAllergyData,
        saveSelectedAllergies,
        deleteUserAllergy
    } = useAllergyData({
        errorMessage,
        loading,
        saving,
        currentUserId,
        allAllergies,
        userAllergies,
        selectedAllergies,
        user,
        sortAllergies,
        clearMessages
    })

    return {
        loading,
        saving,
        errorMessage,
        allAllergies,
        userAllergies,
        selectedAllergies,
        clearSelectedAllergies,
        clearPreferenceState,
        loadAllergyData,
        loadAllergies,
        loadUserAllergies,
        getFilteredAllergies,
        addSelectedAllergy,
        removeSelectedAllergy,
        saveSelectedAllergies,
        deleteUserAllergy
    }
})