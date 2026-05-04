import { defineStore } from 'pinia'
import { getRequestErrorMessage } from '~/utils/auth'

export const useAuthStore = defineStore('auth', () => {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()
    const { t } = useI18n()

    const loading = ref(false)
    const errorMessage = ref('')
    const successMessage = ref('')
    const profileUrl = ref('')
    const username = ref('')

    const clearMessages = () => {
        errorMessage.value = ''
        successMessage.value = ''
    }

    const clearProfileData = () => {
        profileUrl.value = ''
        username.value = ''
    }

    const { saveRememberPreference, clearRememberPreference } = useRememberMe()

    const { loadProfileData, initializeProfile, updateProfileImage } = useAuthProfile({
        clearMessages,
        clearProfileData,
        errorMessage,
        successMessage,
        loading,
        profileUrl,
        username,
        user
    })

    const { updateUsername, updatePassword, updateEmail } = useAccountSettings({
        clearMessages,
        errorMessage,
        successMessage,
        loading,
        user
    })

    const signUp = async (email: string, password: string, username: string) => {
        clearMessages()
        loading.value = true

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username: username
                    }
                }
            })

            if (error) {
                errorMessage.value = error.message
                return false
            }

            if (data.user) {
                if (data.session) {
                    successMessage.value = t('auth.flow.signUp.success')
                } else {
                    successMessage.value = t('auth.flow.signUp.successConfirmEmail')
                }
            }

            return true
        } catch (error: any) {
            errorMessage.value = error?.message || t('auth.flow.signUp.unexpected')
            return false
        } finally {
            loading.value = false
        }
    }

    const signIn = async (loginValue: string, password: string, rememberMe = false) => {
        clearMessages()
        loading.value = true

        try {
            let emailToLogin = loginValue.trim()

            if (!emailToLogin.includes('@')) {
                const response = await $fetch<{ email: string }>('/api/auth/login', {
                    method: 'POST',
                    body: {
                        loginValue: emailToLogin
                    }
                })

                emailToLogin = response.email
            }

            const { data, error } = await supabase.auth.signInWithPassword({
                email: emailToLogin,
                password
            })

            if (error) {
                if (error.code === 'email_not_confirmed') {
                    errorMessage.value = t('auth.flow.signIn.emailNotConfirmed')
                    return false
                }

                errorMessage.value = t('auth.flow.signIn.invalidCredentials')
                return false
            }

            if (!data.user) {
                errorMessage.value = t('auth.flow.signIn.failed')
                return false
            }

            saveRememberPreference(rememberMe)
            await loadProfileData(data.user.id)

            successMessage.value = t('auth.flow.signIn.success')
            return true
        } catch (error: any) {
            errorMessage.value = getRequestErrorMessage(error, t('auth.flow.signIn.unexpected'))
            return false
        } finally {
            loading.value = false
        }
    }

    const signOut = async () => {
        clearMessages()

        const { error } = await supabase.auth.signOut()

        clearRememberPreference()
        clearProfileData()

        if (error) {
            errorMessage.value = t('auth.flow.signOut.failed')
            return false
        }

        successMessage.value = t('auth.flow.signOut.success')
        return true
    }

    const requestPasswordReset = async (email: string) => {
        clearMessages()
        loading.value = true

        try {
            const trimmedEmail = email.trim().toLowerCase()

            await $fetch('/api/auth/password-reset', {
                method: 'POST',
                body: {
                    email: trimmedEmail
                }
            })

            const redirectTo = process.client
                ? `${window.location.origin}/password-reset`
                : undefined

            const { error } = await supabase.auth.resetPasswordForEmail(
                trimmedEmail,
                redirectTo ? { redirectTo } : undefined
            )

            if (error) {
                errorMessage.value = error.message
                return false
            }

            successMessage.value = t('auth.flow.requestReset.success')
            return true
        } catch (error: any) {
            errorMessage.value = getRequestErrorMessage(error, t('auth.flow.requestReset.failed'))
            return false
        } finally {
            loading.value = false
        }
    }

    const completePasswordReset = async (newPassword: string) => {
        clearMessages()
        loading.value = true

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            })

            if (error) {
                errorMessage.value = error.message
                return false
            }

            clearRememberPreference()
            await supabase.auth.signOut()
            clearProfileData()

            successMessage.value = t('auth.flow.completeReset.success')
            return true
        } catch (error: any) {
            errorMessage.value = error?.message || t('auth.flow.completeReset.failed')
            return false
        } finally {
            loading.value = false
        }
    }

    return {
        user,
        loading,
        errorMessage,
        successMessage,
        profileUrl,
        username,
        clearMessages,
        clearProfileData,
        loadProfileData,
        initializeProfile,
        updateProfileImage,
        signUp,
        signIn,
        signOut,
        requestPasswordReset,
        completePasswordReset,
        updateUsername,
        updatePassword,
        updateEmail
    }
})