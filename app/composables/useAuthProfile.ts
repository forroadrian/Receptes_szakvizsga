import { getRequestErrorMessage } from '~/utils/auth'

type ProfileResponse = {
    username: string
    email: string
    profile_url: string
}

type UseAuthProfileOptions = {
    clearMessages: () => void
    clearProfileData: () => void
    errorMessage: Ref<string>
    successMessage: Ref<string>
    loading: Ref<boolean>
    profileUrl: Ref<string>
    user: Ref<any>
}

export const useAuthProfile = ({
    clearMessages,
    clearProfileData,
    errorMessage,
    successMessage,
    loading,
    profileUrl,
    user
}: UseAuthProfileOptions) => {
    const supabase = useSupabaseClient()
    const PROFILE_BUCKET = 'profile-images'

    const resolveProfileImageUrl = (savedProfileUrl?: string | null) => {
        if (!savedProfileUrl || savedProfileUrl.trim() === '') {
            return ''
        }

        if (
            savedProfileUrl.startsWith('/icons/') ||
            savedProfileUrl.startsWith('http://') ||
            savedProfileUrl.startsWith('https://') ||
            savedProfileUrl.startsWith('data:image/')
        ) {
            return savedProfileUrl
        }

        const { data } = supabase
            .storage
            .from(PROFILE_BUCKET)
            .getPublicUrl(savedProfileUrl)

        return `${data.publicUrl}?t=${Date.now()}`
    }

    const loadProfileData = async (customUserId?: string) => {
        const userId = customUserId || user.value?.id || user.value?.sub

        if (!userId) {
            clearProfileData()
            return null
        }

        try {
            const data = await $fetch<ProfileResponse>('/api/auth/profile', { method: 'GET' })

            profileUrl.value = resolveProfileImageUrl(data?.profile_url)

            return data
        } catch (error: any) {
            errorMessage.value = getRequestErrorMessage(error, 'Nem sikerült betölteni a profiladatokat.')
            return null
        }
    }

    const initializeProfile = async () => {
        try {
            const { data, error } = await supabase.auth.getUser()

            if (error || !data.user) {
                clearProfileData()
                return null
            }

            return await loadProfileData(data.user.id)
        } catch (error: any) {
            clearProfileData()
            errorMessage.value = error?.message || 'Nem sikerült betölteni a profiladatokat.'
            return null
        }
    }

    const updateProfileImage = async (file: File) => {
        clearMessages()

        if (!user.value) {
            errorMessage.value = 'Nincs bejelentkezett felhasználó.'
            return false
        }

        const userId = user.value.id || user.value.sub
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'png'
        const filePath = `${userId}/profile-image.${fileExtension}`

        loading.value = true

        try {
            const { error: uploadError } = await supabase
                .storage
                .from(PROFILE_BUCKET)
                .upload(filePath, file, {
                    upsert: true,
                    contentType: file.type
                })

            if (uploadError) {
                console.error('Storage upload error:', uploadError)
                errorMessage.value = uploadError.message || 'Nem sikerült feltölteni a profilképet.'
                return false
            }

            await $fetch('/api/auth/profile-image', {
                method: 'PUT',
                body: {
                    profileUrl: filePath
                }
            })

            const { data } = supabase
                .storage
                .from(PROFILE_BUCKET)
                .getPublicUrl(filePath)

            profileUrl.value = `${data.publicUrl}?t=${Date.now()}`
            successMessage.value = 'Sikeres profilkép módosítás.'
            return true
        } catch (error: any) {
            console.error('Unexpected profile image error:', error)
            errorMessage.value = getRequestErrorMessage(error, 'Hiba történt a profilkép módosításakor.')
            return false
        } finally {
            loading.value = false
        }
    }

    return {
        loadProfileData,
        initializeProfile,
        updateProfileImage
    }
}