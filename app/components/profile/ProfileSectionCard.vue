<template>
    <section class="profile-section-card">
        <div class="section-title mb-4 pb-3">
            <h2 class="mb-0">{{ title }}</h2>
        </div>

        <slot />
    </section>
</template>

<script setup>
defineProps({
    title: {
        type: String,
        required: true,
    },
});
</script>