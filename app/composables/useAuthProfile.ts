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
    const { t } = useI18n()
    const PROFILE_BUCKET = 'profile-images'

    const LEGACY_DEFAULT_AVATAR_PATHS = new Set(['/icons/profile.png'])

    const resolveProfileImageUrl = (savedProfileUrl?: string | null) => {
        if (!savedProfileUrl || savedProfileUrl.trim() === '') {
            return ''
        }

        if (LEGACY_DEFAULT_AVATAR_PATHS.has(savedProfileUrl)) {
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
            errorMessage.value = getRequestErrorMessage(error, t('auth.profile.loadFailed'))
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
            errorMessage.value = error?.message || t('auth.profile.loadFailed')
            return null
        }
    }

    const updateProfileImage = async (file: File) => {
        clearMessages()

        if (!user.value) {
            errorMessage.value = t('auth.account.noUser')
            return false
        }

        loading.value = true

        try {
            const formData = new FormData()
            formData.append('file', file)

            const { profileUrl: uploadedUrl } = await $fetch<{ profileUrl: string }>('/api/auth/profile-image', {
                method: 'PUT',
                body: formData
            })

            profileUrl.value = `${uploadedUrl}?t=${Date.now()}`
            successMessage.value = t('auth.profile.image.success')
            return true
        } catch (error: any) {
            console.error('Unexpected profile image error:', error)
            errorMessage.value = getRequestErrorMessage(error, t('auth.profile.image.failed'))
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