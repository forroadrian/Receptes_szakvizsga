<script setup lang="ts">
import type { SearchOptions } from '@/types/SearchBarOptions'

const props = defineProps<SearchOptions>()
const searchText = ref<string>("");

const filteredData = computed<Array<any>>(() =>{
    // TODO: create data structures
    return props.data.data.filter((value) => {
        let title: string = value.title
        return title.includes(searchText.value)
    })
});

const filter = () => {
    props.data.data.filter
}

</script>

<template>
    <input type="text" name="" id="" :placeholder="visual?.placeholder" v-model="searchText">
</template>