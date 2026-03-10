<script setup lang="ts">

const props = withDefaults(defineProps<{
    amount?: number,
    image?: string,
    description?: string,
    alt?: string,
}>(), {
    amount: 0,
    image: "#",
    description: "friss",
    alt: "friss etelek"
})

</script>
<template>
    <CardBase media-position="topLeft" :show-divider="false" class="small-card" content-class="content-settings" body-class="to-bottom" media-class="small-picture">
        <template #media>
            <div class="w-100 text-secondary asd">
                <NuxtImg :src="props.image" fit="cover" :alt="alt" class="img-fluid mx-auto h-100" />
            </div>
        </template>
        <template #header>
            <CardHeader>
                <CardTitle :rank="3" >{{ amount }}</CardTitle>
            </CardHeader>
        </template>
        <template #body>
            <span class="text-center pb-0 mb-0 small text-truncate d-inline-block">{{ description }}</span>
        </template>
    </CardBase>
</template>
<style scoped>

.small-card {
    max-width: 250px;
    max-height: 80px;
}


</style>