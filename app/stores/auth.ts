import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()

    const loading = ref(false)
    const errorMessage = ref('')
    const successMessage = ref('')
    const profileUrl = ref('')

    const REMEMBER_COOKIE = 'menuplanr_remember_login'
    const SESSION_COOKIE = 'menuplanr_session_login'
    const PROFILE_BUCKET = 'profile-images'

    type ProfileResponse = {
        username: string
        email: string
        profile_url: string
    }

    const getRequestErrorMessage = (error: any, fallback: string) => {
        return error?.data?.statusMessage || error?.statusMessage || error?.message || fallback
    }

    const clearMessages = () => {
        errorMessage.value = ''
        successMessage.value = ''
    }

    const clearProfileData = () => {
        profileUrl.value = ''
    }

    const setCookie = (name: string, value: string, maxAge?: number) => {
        if (!process.client) return

        let cookie = `${name}=${value}; path=/; SameSite=Lax`

        if (maxAge) {
            cookie += `; max-age=${maxAge}`
        }

        document.cookie = cookie
    }

    const clearCookie = (name: string) => {
        if (!process.client) return

        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`
    }

    const saveRememberPreference = (rememberMe: boolean) => {
        if (!process.client) return

        if (rememberMe) {
            setCookie(REMEMBER_COOKIE, '1', 60 * 60 * 24 * 30)
            clearCookie(SESSION_COOKIE)
        } else {
            setCookie(SESSION_COOKIE, '1')
            clearCookie(REMEMBER_COOKIE)
        }
    }

    const clearRememberPreference = () => {
        clearCookie(REMEMBER_COOKIE)
        clearCookie(SESSION_COOKIE)
    }

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

            try {
                await supabase.auth.refreshSession()
            } catch (e) {
                console.warn('Session refresh hiba, de nem kritikus', e)
            }

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