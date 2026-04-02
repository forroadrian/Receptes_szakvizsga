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

    const refreshSessionSafely = async () => {
        try {
            await supabase.auth.refreshSession()
        } catch (e) {
            console.warn('Session refresh hiba, de nem kritikus', e)
        }
    }

    const updateUsername = async (newUsername: string) => {
        clearMessages()

        if (!user.value) {
            errorMessage.value = 'Nincs bejelentkezett felhasználó.'
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
                errorMessage.value = 'Az adatbázis frissült, de a bejelentkezési adatok nem.'
                return false
            }

            await refreshSessionSafely()

            successMessage.value = 'Sikeres felhasználónév módosítás.'
            return true
        } catch (error: any) {
            errorMessage.value = getRequestErrorMessage(error, 'Hiba történt a felhasználónév módosításakor.')
            return false
        } finally {
            loading.value = false
        }
    }

    const updatePassword = async (currentPassword: string, newPassword: string) => {
        clearMessages()

        if (!user.value) {
            errorMessage.value = 'Nincs bejelentkezett felhasználó.'
            return false
        }

        const email = user.value.email

        if (!email) {
            errorMessage.value = 'Nem található a felhasználó email címe.'
            return false
        }

        loading.value = true

        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password: currentPassword
            })

            if (signInError) {
                errorMessage.value = 'A jelenlegi jelszó hibás.'
                return false
            }

            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword
            })

            if (updateError) {
                errorMessage.value = 'Nem sikerült módosítani a jelszót.'
                return false
            }

            await refreshSessionSafely()

            successMessage.value = 'Sikeres jelszó módosítás.'
            return true
        } catch (error: any) {
            errorMessage.value = error?.message || 'Hiba történt a jelszó módosításakor.'
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
                errorMessage.value = 'Nem sikerült lekérni a bejelentkezett felhasználót.'
                return false
            }

            const authUser = authUserData.user

            if (authUser.new_email && authUser.new_email !== authUser.email) {
                errorMessage.value = 'Már van folyamatban lévő email módosítás. Előbb azt fejezd be.'
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
                errorMessage.value = 'Nem sikerült módosítani az email címet.'
                return false
            }

            if (!data.user || data.user.new_email?.toLowerCase() !== trimmedNewEmail) {
                errorMessage.value = 'Az email módosítási kérés nem indult el rendesen.'
                return false
            }

            successMessage.value = 'Megerősítő email elküldve. Nézd meg a régi és az új email címedet is.'
            return true
        } catch (error: any) {
            errorMessage.value = getRequestErrorMessage(error, 'Hiba történt az email cím módosításakor.')
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