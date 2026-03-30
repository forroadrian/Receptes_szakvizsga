<script setup>
import ProfilePageContent from './ProfilePageContent.vue';

definePageMeta({
    middleware: 'auth-only'
});
</script>

<template>
    <ProfilePageContent />
</template>