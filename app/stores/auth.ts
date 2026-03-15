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
        } catch (error) {
            errorMessage.value = 'Váratlan hiba történt a regisztráció során.'
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
        clearMessages,
        signUp
    }
})