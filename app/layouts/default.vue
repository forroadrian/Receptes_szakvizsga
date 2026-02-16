<template>
    <div class="appLayouts">
        <Header />

        <main class="appLayoutsMain container py-4">
            <slot />
        </main>

        <Footer />
    </div>
</template>

<style scoped>
.appLayouts {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.appLayoutsMain {
    flex: 1;
}
</style>
