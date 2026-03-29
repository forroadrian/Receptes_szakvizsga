<script setup>
const route = useRoute();
const showFooter = computed(() => !route.path.startsWith('/profile'));
</script>

<template>
    <div class="appLayouts herobg">
        <HeaderComponent />

        <main class="appLayoutsMain container">
            <slot> </slot>
        </main>

        <FooterComponent v-if="showFooter" />
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