import { getRequestErrorMessage } from '~/utils/auth'
import type { Database } from '~/types/database.types'

type AllergyRow = Database['public']['Tables']['allergy']['Row']

type UseAllergyDataOptions = {
    errorMessage: Ref<string>
    loading: Ref<boolean>
    saving: Ref<boolean>
    currentUserId: Ref<string>
    allAllergies: Ref<AllergyRow[]>
    userAllergies: Ref<AllergyRow[]>
    selectedAllergies: Ref<AllergyRow[]>
    user: Ref<any>
    sortAllergies: (items: AllergyRow[]) => AllergyRow[]
    clearMessages: () => void
}

export const useAllergyData = ({
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
}: UseAllergyDataOptions) => {
    const setCurrentUserId = (userId = '') => {
        currentUserId.value = userId || ''
    }

    const getCurrentUserId = () => {
        return currentUserId.value || user.value?.id || user.value?.sub || ''
    }

    const clearAllergyState = () => {
        currentUserId.value = ''
        userAllergies.value = []
        selectedAllergies.value = []
        clearMessages()
    }

    const loadAllergies = async () => {
        clearMessages()

        try {
            const data = await $fetch<AllergyRow[]>('/api/preferences/allergy', {
                method: 'GET'
            })

            allAllergies.value = data || []
            return true
        } catch (error: any) {
            errorMessage.value = getRequestErrorMessage(error, 'Nem sikerült betölteni az allergéneket.')
            return false
        }
    }

    const loadUserAllergies = async (userId = getCurrentUserId()) => {
        clearMessages()
        setCurrentUserId(userId)

        if (!userId) {
            userAllergies.value = []
            selectedAllergies.value = []
            return true
        }

        try {
            if (!allAllergies.value.length) {
                const loadAllergyListSuccess = await loadAllergies()

                if (!loadAllergyListSuccess) {
                    return false
                }
            }

            const data = await $fetch<{ allergy_id: number }[]>('/api/preferences/user-allergy', {
                method: 'GET'
            })

            const allergyIds = (data || []).map(item => item.allergy_id)

            userAllergies.value = sortAllergies(
                allAllergies.value.filter(item => allergyIds.includes(item.id))
            )

            selectedAllergies.value = []
            return true
        } catch (error: any) {
            errorMessage.value = getRequestErrorMessage(error, 'Nem sikerült betölteni a felhasználó allergiáit.')
            return false
        }
    }

    const loadAllergyData = async (userId = getCurrentUserId()) => {
        loading.value = true
        setCurrentUserId(userId)

        try {
            const loadAllergyListSuccess = await loadAllergies()

            if (!loadAllergyListSuccess) {
                return false
            }

            return await loadUserAllergies(userId)
        } finally {
            loading.value = false
        }
    }

    const saveSelectedAllergies = async (userId = getCurrentUserId()) => {
        clearMessages()
        setCurrentUserId(userId)

        if (!userId) {
            errorMessage.value = 'Nincs bejelentkezett felhasználó.'
            return false
        }

        saving.value = true

        try {
            await $fetch('/api/preferences/user-allergy', {
                method: 'POST',
                body: {
                    allergyIds: selectedAllergies.value.map(item => item.id)
                }
            })

            userAllergies.value = sortAllergies([
                ...userAllergies.value,
                ...selectedAllergies.value
            ])

            selectedAllergies.value = []
            return true
        } catch (error: any) {
            errorMessage.value = getRequestErrorMessage(error, 'Nem sikerült elmenteni az allergéneket.')
            return false
        } finally {
            saving.value = false
        }
    }

    const deleteUserAllergy = async (allergyId: number, userId = getCurrentUserId()) => {
        clearMessages()
        setCurrentUserId(userId)

        if (!userId) {
            errorMessage.value = 'Nincs bejelentkezett felhasználó.'
            return false
        }

        try {
            await $fetch('/api/preferences/user-allergy', {
                method: 'DELETE',
                body: {
                    allergyId
                }
            })

            userAllergies.value = userAllergies.value.filter(item => item.id !== allergyId)
            selectedAllergies.value = selectedAllergies.value.filter(item => item.id !== allergyId)
            return true
        } catch (error: any) {
            errorMessage.value = getRequestErrorMessage(error, 'Nem sikerült törölni az allergént.')
            return false
        }
    }

    return {
        clearAllergyState,
        loadAllergies,
        loadUserAllergies,
        loadAllergyData,
        saveSelectedAllergies,
        deleteUserAllergy
    }
}