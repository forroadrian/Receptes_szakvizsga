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

    const updateUsername = async (newUsername: string) => {
        clearMessages()

        if (!user.value) {
            errorMessage.value = 'Nincs bejelentkezett felhasználó.'
            return false
        }

        const userId = user.value.id || user.value.sub
        const trimmedUsername = newUsername.trim()

        if (!trimmedUsername) {
            errorMessage.value = 'Add meg a felhasználónevet.'
            return false
        }

        if (trimmedUsername.length < 4) {
            errorMessage.value = 'A felhasználónév legalább 4 karakter legyen.'
            return false
        }

        loading.value = true

        try {
            const { data: currentUser, error: currentUserError } = await supabase
                .from('user')
                .select('username')
                .eq('id', userId)
                .single()

            if (currentUserError || !currentUser) {
                errorMessage.value = 'Nem sikerült lekérni a jelenlegi felhasználónevet.'
                return false
            }

            if (currentUser.username === trimmedUsername) {
                errorMessage.value = 'Az új felhasználónév megegyezik a régivel.'
                return false
            }

            const { data: existingUsernameUser, error: usernameCheckError } = await supabase
                .from('user')
                .select('id')
                .eq('username', trimmedUsername)
                .neq('id', userId)
                .limit(1)
                .maybeSingle()

            if (usernameCheckError) {
                errorMessage.value = 'Nem sikerült ellenőrizni a felhasználónevet.'
                return false
            }

            if (existingUsernameUser) {
                errorMessage.value = 'Ez a felhasználónév már foglalt.'
                return false
            }

            const { error: dbError } = await supabase
                .from('user')
                .update({ username: trimmedUsername })
                .eq('id', userId)

            if (dbError) {
                errorMessage.value = 'Nem sikerült frissíteni a felhasználónevet az adatbázisban.'
                return false
            }

            const { error: authUpdateError } = await supabase.auth.updateUser({
                data: { username: trimmedUsername }
            })

            if (authUpdateError) {
                errorMessage.value = 'Az adatbázis frissült, de a bejelentkezési adatok nem.'
                return false
            }

            try {
                await supabase.auth.refreshSession()
            } catch (e) {
                console.warn('Session refresh hiba, de nem kritikus', e)
            }

            successMessage.value = 'Sikeres felhasználónév módosítás.'
            return true
        } catch (error: any) {
            errorMessage.value = error?.message || 'Hiba történt a felhasználónév módosításakor.'
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

        if (!currentPassword || !newPassword) {
            errorMessage.value = 'Minden mezőt ki kell tölteni.'
            return false
        }

        if (newPassword.length < 6) {
            errorMessage.value = 'Az új jelszó legalább 6 karakter legyen.'
            return false
        }

        if (currentPassword === newPassword) {
            errorMessage.value = 'Az új jelszó nem egyezhet meg a régivel.'
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

            try {
                await supabase.auth.refreshSession()
            } catch (e) {
                console.warn('Session refresh hiba, de nem kritikus', e)
            }

            successMessage.value = 'Sikeres jelszó módosítás.'
            return true
        } catch (error: any) {
            errorMessage.value = error?.message || 'Hiba történt a jelszó módosításakor.'
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
        signUp,
        signIn,
        signOut,
        updateUsername,
        updatePassword
    }
})