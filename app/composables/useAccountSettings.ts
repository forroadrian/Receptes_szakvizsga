import { getRequestErrorMessage } from '~/utils/auth'

type UseAccountSettingsOptions = {
    clearMessages: () => void
    errorMessage: Ref<string>
    successMessage: Ref<string>
    loading: Ref<boolean>
    user: Ref<any>
}

export const useAccountSettings = ({
    clearMessages,
    errorMessage,
    successMessage,
    loading,
    user
}: UseAccountSettingsOptions) => {
    const supabase = useSupabaseClient()
    const { t } = useI18n()

    const refreshSessionSafely = async () => {
        try {
            await supabase.auth.refreshSession()
        } catch (e) {
            console.warn('Session refresh failed (non-critical)', e)
        }
    }

    const updateUsername = async (newUsername: string) => {
        clearMessages()

        if (!user.value) {
            errorMessage.value = t('auth.account.noUser')
            return false
        }

        const trimmedUsername = newUsername.trim()

        loading.value = true

        try {
            await $fetch('/api/auth/username', {
                method: 'PUT',
                body: {
                    username: trimmedUsername
                }
            })

            const { error: authUpdateError } = await supabase.auth.updateUser({
                data: { username: trimmedUsername }
            })

            if (authUpdateError) {
                errorMessage.value = t('auth.account.username.partialFailure')
                return false
            }

            await refreshSessionSafely()

            successMessage.value = t('auth.account.username.success')
            return true
        } catch (error: any) {
            errorMessage.value = getRequestErrorMessage(error, t('auth.account.username.failed'))
            return false
        } finally {
            loading.value = false
        }
    }

    const updatePassword = async (currentPassword: string, newPassword: string) => {
        clearMessages()

        if (!user.value) {
            errorMessage.value = t('auth.account.noUser')
            return false
        }

        const email = user.value.email

        if (!email) {
            errorMessage.value = t('auth.account.noEmail')
            return false
        }

        loading.value = true

        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password: currentPassword
            })

            if (signInError) {
                errorMessage.value = t('auth.account.password.currentWrong')
                return false
            }

            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword
            })

            if (updateError) {
                errorMessage.value = t('auth.account.password.updateFailed')
                return false
            }

            await refreshSessionSafely()

            successMessage.value = t('auth.account.password.success')
            return true
        } catch (error: any) {
            errorMessage.value = error?.message || t('auth.account.password.failed')
            return false
        } finally {
            loading.value = false
        }
    }

    const updateEmail = async (currentEmail: string, newEmail: string) => {
        clearMessages()

        const trimmedCurrentEmail = currentEmail.trim().toLowerCase()
        const trimmedNewEmail = newEmail.trim().toLowerCase()

        try {
            const { data: authUserData, error: authUserError } = await supabase.auth.getUser()

            if (authUserError || !authUserData.user) {
                errorMessage.value = t('auth.account.email.fetchUserFailed')
                return false
            }

            const authUser = authUserData.user

            if (authUser.new_email && authUser.new_email !== authUser.email) {
                errorMessage.value = t('auth.account.email.alreadyPending')
                return false
            }

            loading.value = true

            await $fetch('/api/auth/email', {
                method: 'PUT',
                body: {
                    currentEmail: trimmedCurrentEmail,
                    newEmail: trimmedNewEmail
                }
            })

            const redirectUrl = `${window.location.origin}/confirm`

            const { data, error } = await supabase.auth.updateUser(
                { email: trimmedNewEmail },
                { emailRedirectTo: redirectUrl }
            )

            if (error) {
                errorMessage.value = t('auth.account.email.updateFailed')
                return false
            }

            if (!data.user || data.user.new_email?.toLowerCase() !== trimmedNewEmail) {
                errorMessage.value = t('auth.account.email.requestNotStarted')
                return false
            }

            successMessage.value = t('auth.account.email.success')
            return true
        } catch (error: any) {
            errorMessage.value = getRequestErrorMessage(error, t('auth.account.email.failed'))
            return false
        } finally {
            loading.value = false
        }
    }

    return {
        updateUsername,
        updatePassword,
        updateEmail
    }
}