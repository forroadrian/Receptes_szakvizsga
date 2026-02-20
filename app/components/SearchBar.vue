<script setup lang="ts">
import type SearchBarOptions from '~/interfaces/SearchBarOptions';

const filter = defineModel<string>()
const props = defineProps<SearchBarOptions>()

const input = ref("")

watch(input,() => {
    filter.value = input.value
})

</script>

<template>
    <input type="text" :placeholder="placeholder" v-model="input">
</template>