import { defineStore } from 'pinia'
import { getRequestErrorMessage } from '~/utils/auth'

export const useAuthStore = defineStore('auth', () => {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()

    const loading = ref(false)
    const errorMessage = ref('')
    const successMessage = ref('')
    const profileUrl = ref('')

    const clearMessages = () => {
        errorMessage.value = ''
        successMessage.value = ''
    }

    const clearProfileData = () => {
        profileUrl.value = ''
    }

    const { saveRememberPreference, clearRememberPreference } = useRememberMe()

    const { loadProfileData, initializeProfile, updateProfileImage } = useAuthProfile({
        clearMessages,
        clearProfileData,
        errorMessage,
        successMessage,
        loading,
        profileUrl,
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
                    successMessage.value = 'Sikeres regisztráció!'
                } else {
                    successMessage.value = 'Sikeres regisztráció! Nézd meg az emailedet a megerősítéshez.'
                }
            }

            return true
        } catch (error: any) {
            errorMessage.value = error?.message || 'Váratlan hiba történt a regisztráció során.'
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
                    errorMessage.value = 'Még nem erősítetted meg az email címedet.'
                    return false
                }

                errorMessage.value = 'Hibás adatok.'
                return false
            }

            if (!data.user) {
                errorMessage.value = 'A bejelentkezés nem sikerült.'
                return false
            }

            saveRememberPreference(rememberMe)
            await loadProfileData(data.user.id)

            successMessage.value = 'Sikeres bejelentkezés!'
            return true
        } catch (error: any) {
            errorMessage.value = getRequestErrorMessage(error, 'Váratlan hiba történt a bejelentkezés során.')
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
            errorMessage.value = 'A kijelentkezés nem sikerült.'
            return false
        }

        successMessage.value = 'Sikeres kijelentkezés!'
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

            successMessage.value = 'A jelszó-visszaállító email elküldve.'
            return true
        } catch (error: any) {
            errorMessage.value = getRequestErrorMessage(error, 'Nem sikerült elküldeni a jelszó-visszaállító emailt.')
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

            successMessage.value = 'A jelszó sikeresen megváltozott. Most jelentkezz be az új jelszóval.'
            return true
        } catch (error: any) {
            errorMessage.value = error?.message || 'Nem sikerült megváltoztatni a jelszót.'
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