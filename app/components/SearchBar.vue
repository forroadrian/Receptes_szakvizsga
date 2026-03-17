<script setup lang="ts">
import type SearchBarOptions from '~/interfaces/SearchBarOptions';

const filter = defineModel<string>()
const props = defineProps<SearchBarOptions>()

const input = ref("")

watch(input, () => {
    filter.value = input.value
})

</script>

<template>
    <input type="text" class="input" :placeholder="placeholder" v-model="input">
</template>

<style scoped>
.input {
    border: 2px solid var(--bs-border-color);
    background: var(--bs-body-bg);
    padding: 5px 10px;
    border-radius: var(--radius-sm);
}
</style>