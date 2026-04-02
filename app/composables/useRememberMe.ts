export const useRememberMe = () => {
    const REMEMBER_COOKIE = 'menuplanr_remember_login'
    const SESSION_COOKIE = 'menuplanr_session_login'

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

    return {
        saveRememberPreference,
        clearRememberPreference
    }
}