import { getRequestErrorMessage } from '~/utils/auth'
import type { Database } from '~/types/database.types'

type IngredientRow = Database['public']['Tables']['ingredient']['Row']

type UseDislikedIngredientDataOptions = {
    errorMessage: Ref<string>
    loading: Ref<boolean>
    saving: Ref<boolean>
    currentUserId: Ref<string>
    allIngredients: Ref<IngredientRow[]>
    userDislikedIngredients: Ref<IngredientRow[]>
    selectedDislikedIngredients: Ref<IngredientRow[]>
    user: Ref<any>
    sortIngredients: (items: IngredientRow[]) => IngredientRow[]
    clearMessages: () => void
}

export const useDislikedIngredientData = ({
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
}: UseDislikedIngredientDataOptions) => {
    const setCurrentUserId = (userId = '') => {
        currentUserId.value = userId || ''
    }

    const getCurrentUserId = () => {
        return currentUserId.value || user.value?.id || user.value?.sub || ''
    }

    const clearDislikedIngredientState = () => {
        currentUserId.value = ''
        userDislikedIngredients.value = []
        selectedDislikedIngredients.value = []
        clearMessages()
    }

    const loadIngredients = async () => {
        clearMessages()

        try {
            const data = await $fetch<IngredientRow[]>('/api/preferences/ingredient', {
                method: 'GET'
            })

            allIngredients.value = data || []
            return true
        } catch (error: any) {
            errorMessage.value = getRequestErrorMessage(error, 'Nem sikerült betölteni az alapanyagokat.')
            return false
        }
    }

    const loadUserDislikedIngredients = async (userId = getCurrentUserId()) => {
        clearMessages()
        setCurrentUserId(userId)

        if (!userId) {
            userDislikedIngredients.value = []
            selectedDislikedIngredients.value = []
            return true
        }

        try {
            if (!allIngredients.value.length) {
                const loadIngredientListSuccess = await loadIngredients()

                if (!loadIngredientListSuccess) {
                    return false
                }
            }

            const data = await $fetch<{ ingredient_id: number }[]>('/api/preferences/user-dislike', {
                method: 'GET'
            })

            const ingredientIds = (data || []).map(item => item.ingredient_id)

            userDislikedIngredients.value = sortIngredients(
                allIngredients.value.filter(item => ingredientIds.includes(item.id))
            )

            selectedDislikedIngredients.value = []
            return true
        } catch (error: any) {
            errorMessage.value = getRequestErrorMessage(error, 'Nem sikerült betölteni a nem kedvelt alapanyagokat.')
            return false
        }
    }

    const loadDislikedIngredientData = async (userId = getCurrentUserId()) => {
        loading.value = true
        setCurrentUserId(userId)

        try {
            const loadIngredientListSuccess = await loadIngredients()

            if (!loadIngredientListSuccess) {
                return false
            }

            return await loadUserDislikedIngredients(userId)
        } finally {
            loading.value = false
        }
    }

    const saveSelectedDislikedIngredients = async (userId = getCurrentUserId()) => {
        clearMessages()
        setCurrentUserId(userId)

        if (!userId) {
            errorMessage.value = 'Nincs bejelentkezett felhasználó.'
            return false
        }

        saving.value = true

        try {
            await $fetch('/api/preferences/user-dislike', {
                method: 'POST',
                body: {
                    ingredientIds: selectedDislikedIngredients.value.map(item => item.id)
                }
            })

            userDislikedIngredients.value = sortIngredients([
                ...userDislikedIngredients.value,
                ...selectedDislikedIngredients.value
            ])

            selectedDislikedIngredients.value = []
            return true
        } catch (error: any) {
            errorMessage.value = getRequestErrorMessage(error, 'Nem sikerült elmenteni a nem kedvelt alapanyagokat.')
            return false
        } finally {
            saving.value = false
        }
    }

    const deleteUserDislikedIngredient = async (ingredientId: number, userId = getCurrentUserId()) => {
        clearMessages()
        setCurrentUserId(userId)

        if (!userId) {
            errorMessage.value = 'Nincs bejelentkezett felhasználó.'
            return false
        }

        try {
            await $fetch('/api/preferences/user-dislike', {
                method: 'DELETE',
                body: {
                    ingredientId
                }
            })

            userDislikedIngredients.value = userDislikedIngredients.value.filter(item => item.id !== ingredientId)
            selectedDislikedIngredients.value = selectedDislikedIngredients.value.filter(item => item.id !== ingredientId)
            return true
        } catch (error: any) {
            errorMessage.value = getRequestErrorMessage(error, 'Nem sikerült törölni a nem kedvelt alapanyagot.')
            return false
        }
    }

    return {
        clearDislikedIngredientState,
        loadIngredients,
        loadUserDislikedIngredients,
        loadDislikedIngredientData,
        saveSelectedDislikedIngredients,
        deleteUserDislikedIngredient
    }
}