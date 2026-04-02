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

    const getRequestErrorMessage = (error: any, fallback: string) => {
        return error?.data?.statusMessage || error?.statusMessage || error?.message || fallback
    }

    const clearMessages = () => {
        errorMessage.value = ''
    }

    const setCurrentUserId = (userId = '') => {
        currentUserId.value = userId || ''
    }

    const clearSelectedAllergies = () => {
        selectedAllergies.value = []
    }

    const clearPreferenceState = () => {
        currentUserId.value = ''
        userAllergies.value = []
        selectedAllergies.value = []
        clearMessages()
    }

    const getCurrentUserId = () => {
        return currentUserId.value || user.value?.id || user.value?.sub || ''
    }

    const sortAllergies = (items: AllergyRow[]) => {
        return [...items].sort((a, b) => a.name.localeCompare(b.name, 'hu'))
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