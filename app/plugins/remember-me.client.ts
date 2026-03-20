export default defineNuxtPlugin(async () => {
    const supabase = useSupabaseClient()
    const route = useRoute()

    const hasCookie = (name: string) => {
        return document.cookie
            .split('; ')
            .some((row) => row.startsWith(`${name}=`))
    }

    if (route.path === '/password-reset') {
        return
    }

    const { data } = await supabase.auth.getSession()

    if (!data.session) {
        return
    }

    const hasRememberCookie = hasCookie('menuplanr_remember_login')
    const hasSessionCookie = hasCookie('menuplanr_session_login')

    if (hasRememberCookie || hasSessionCookie) {
        return
    }

    await supabase.auth.signOut()
})