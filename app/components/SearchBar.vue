<script setup lang="ts">
import type { possibleHaystack, SearchOptions } from '@/types/SearchBarOptions'
import type Ingredient from '~/models/Ingredient';

const props = defineProps<SearchOptions>();
const emit = defineEmits([''])
const searchText = ref<string>("");

const filteredData = computed<possibleHaystack>(() =>{
    // TODO: create data structures
    return props.haystack.filter((value) => {
        let title: string = value.name
        return title.includes(searchText.value)
    })
});

</script>

<template>
    <input type="text" name="" id="" :placeholder="placeholder" v-model="searchText">
</template>