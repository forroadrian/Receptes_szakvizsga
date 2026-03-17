import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()

    const loading = ref(false)
    const errorMessage = ref('')
    const successMessage = ref('')

    const clearMessages = () => {
        errorMessage.value = ''
        successMessage.value = ''
    }

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

    const signIn = async (loginValue: string, password: string) => {
        clearMessages()
        loading.value = true

        try {
            let emailToLogin = loginValue.trim()

            if (!emailToLogin.includes('@')) {
                const { data: userRow, error: userError } = await supabase
                    .from('user')
                    .select('email')
                    .eq('username', emailToLogin)
                    .maybeSingle()

                if (userError || !userRow) {
                    errorMessage.value = 'Nem létezik ilyen felhasználónév.'
                    return false
                }

                emailToLogin = userRow.email
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

            successMessage.value = 'Sikeres bejelentkezés!'
            return true
        } catch (error: any) {
            errorMessage.value = error?.message || 'Váratlan hiba történt a bejelentkezés során.'
            return false
        } finally {
            loading.value = false
        }
    }

    const signOut = async () => {
        clearMessages()

        const { error } = await supabase.auth.signOut()

        if (error) {
            errorMessage.value = 'A kijelentkezés nem sikerült.'
            return false
        }

        successMessage.value = 'Sikeres kijelentkezés!'
        return true
    }

    return {
        user,
        loading,
        errorMessage,
        successMessage,
        clearMessages,
        signUp,
        signIn,
        signOut
    }
})