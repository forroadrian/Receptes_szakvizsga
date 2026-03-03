<template>
    <div class="appLayouts">
        <HeaderComponent />

        <main class="appLayoutsMain container py-4">
            <slot> </slot>
            <ButtonTest />

        </main>

        <FooterComponent />
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
