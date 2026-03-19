<script setup>
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const redirectInfo = useSupabaseCookieRedirect()

onMounted(async () => {
    await supabase.auth.getSession()
})

watch(
    user,
    () => {
        if (user.value) {
            const path = redirectInfo.pluck()
            return navigateTo(path || '/profile')
        }
    },
    { immediate: true }
)
</script>

<template>
    <div class="container py-5 text-center">
        <h3>Hitelesítés folyamatban...</h3>
        <p>Kérlek várj egy pillanatot.</p>
    </div>
</template>