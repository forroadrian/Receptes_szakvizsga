<script setup lang="ts">
import type SearchParams from "~/interfaces/SearchParams";
import Ingredient from "~/models/Ingredient";

const searchText = ref<string>();

const ingredients: Ingredient[] = [
  new Ingredient("alma", 10, "kg"),
  new Ingredient("körte", 10, "dkg"),
  new Ingredient("Tej", 2, "l"),
];

const searchParams = ref<SearchParams<Ingredient>>({
  haystack: ingredients,
  searchFor: ["name"],
});

computed(() => {
  searchParams.value.query = searchText.value;
});

const results = useSearch(searchParams);
console.log(results.value)
</script>

<template>
  <div class="container mt-3">
    <div class="row mb-3">
      <h1 class="col-12">Alapanyagok</h1>
      <p class="col-8 pe-4 text-wrap">
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Omnis officia
        voluptatibus similique inventore assumenda quia accusantium minima
        deserunt veniam qui ut, a corrupti exercitationem, itaque tempore saepe
        sed sapiente nobis!
      </p>
      <Button
        class="col-4 new-ingredient m-auto align-self-center"
        icon="bi bi-plus"
        type="button"
        color="dark"
        >Új hozzávaló hozzáadása</Button
      >
    </div>
    <div class="row d-flex justify-content-evenly pb-4 border-bottom">
      <span class="pe-1 col-lg-3 col-md-6 mb-3 w-10">
        <IngredientCardAmount
          :amount="0"
          image="/logo.png"
          :description="'Összes'"
        />
      </span>
      <span class="pe-1 col-lg-3 col-md-6 w-10">
        <IngredientCardAmount
          :amount="0"
          image="/logo.png"
          :description="'Friss'"
        />
      </span>
      <span class="pe-1 col-lg-3 col-md-6 w-10">
        <IngredientCardAmount
          :amount="0"
          image="/logo.png"
          :description="'Hamarosan Lejár'"
        />
      </span>
      <span class="pe-1 col-lg-3 col-md-6 w-10">
        <IngredientCardAmount
          :amount="0"
          image="/logo.png"
          :description="'Lejárt'"
        />
      </span>
    </div>
    <div class="row mt-4">
      <h2>Meglébő alapanyagaim</h2>
      <SearchBar v-model="searchText" />
      <div>
        <h3 class="fs-3">Találatok az alábbi keresésre:</h3>
        <div class="container">
          <span class="pe-1 col-lg-3 col-md-6 w-10" v-for="ingredient in results">
            {{ ingredient.name }}
            <IngredientCardAmount
              :amount="ingredient.amount"
              image="/logo.png"
              :description="ingredient.name"
            />
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.card--base {
  padding: 0;
}
</style>

<style scoped>
.new-ingredient {
  max-width: 25vw;
}
</style>
