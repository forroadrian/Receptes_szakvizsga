<script setup lang="ts">
import type SearchParams from '~/interfaces/SearchParams';
import Ingredient from '~/models/Ingredient';

// Get a list of Ingredients (or any class) you want to use
const ingredients: Ingredient[] = [
    new Ingredient("alma",10,"kg"),
    new Ingredient("körte",10,"dkg"),
    new Ingredient("Tej",2,"l")
]

// create an object with the keys stated in SearchParams
const params = ref<SearchParams<Ingredient>>({
    haystack: ingredients,
    searchFor: ["name"],
    query: ""
})

// and then just call useSearch on the ref that has the object inside it
const results = useSearch(params);

</script>
<template>
  <div>
    <h2>Test</h2>
    <p>{{ params.query }}</p>
    <p>{{ results }}</p>
    <SearchBar placeholder="This is what a placeholder is" v-model="params.query"/>
</div>
</template>