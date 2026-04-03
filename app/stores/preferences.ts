import { defineStore } from 'pinia'
import type { Database } from '~/types/database.types'

type AllergyRow = Database['public']['Tables']['allergy']['Row']
type IngredientRow = Database['public']['Tables']['ingredient']['Row']

export const usePreferencesStore = defineStore('preferences', () => {
    const user = useSupabaseUser()

    const loading = ref(false)
    const saving = ref(false)
    const errorMessage = ref('')
    const currentUserId = ref('')

    const allAllergies = ref<AllergyRow[]>([])
    const userAllergies = ref<AllergyRow[]>([])
    const selectedAllergies = ref<AllergyRow[]>([])
    const allIngredients = ref<IngredientRow[]>([])
    const userDislikedIngredients = ref<IngredientRow[]>([])
    const selectedDislikedIngredients = ref<IngredientRow[]>([])

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
        sortIngredients,
        clearSelectedDislikedIngredients,
        getFilteredDislikedIngredients,
        addSelectedDislikedIngredient,
        removeSelectedDislikedIngredient
    } = useDislikedIngredientSelection({
        allIngredients,
        userDislikedIngredients,
        selectedDislikedIngredients
    })

    const {
        clearAllergyState,
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

    const {
        clearDislikedIngredientState,
        loadIngredients,
        loadUserDislikedIngredients,
        loadDislikedIngredientData,
        saveSelectedDislikedIngredients,
        deleteUserDislikedIngredient
    } = useDislikedIngredientData({
        errorMessage,
        loading,
        saving,
        currentUserId,
        allIngredients,
        userDislikedIngredients,
        selectedDislikedIngredients,
        user,
        sortIngredients,
        clearMessages
    })

    const clearPreferenceState = () => {
        clearAllergyState()
        clearDislikedIngredientState()
    }

    const loadPreferenceData = async (userId = currentUserId.value || user.value?.id || user.value?.sub || '') => {
        const allergySuccess = await loadAllergyData(userId)

        if (!allergySuccess) {
            return false
        }

        return await loadDislikedIngredientData(userId)
    }

    return {
        loading,
        saving,
        errorMessage,
        allAllergies,
        userAllergies,
        selectedAllergies,
        allIngredients,
        userDislikedIngredients,
        selectedDislikedIngredients,
        clearSelectedAllergies,
        clearSelectedDislikedIngredients,
        clearPreferenceState,
        loadPreferenceData,
        loadAllergyData,
        loadAllergies,
        loadUserAllergies,
        loadDislikedIngredientData,
        loadIngredients,
        loadUserDislikedIngredients,
        getFilteredAllergies,
        getFilteredDislikedIngredients,
        addSelectedAllergy,
        addSelectedDislikedIngredient,
        removeSelectedAllergy,
        removeSelectedDislikedIngredient,
        saveSelectedAllergies,
        saveSelectedDislikedIngredients,
        deleteUserAllergy,
        deleteUserDislikedIngredient
    }
})