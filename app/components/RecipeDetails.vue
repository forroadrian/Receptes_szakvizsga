<script setup >
import Recipe from '~/models/Recipe';
import Ingredient from '~/models/Ingredient';
import Allergy from '~/models/Allergy';

const route = useRoute();
const recipeId = route.params.id;
const colorMode = useColorMode();

const buttonColor = computed(() => {
    if (colorMode.value === "dark") return "soft";
    return "dark";
})


const recipe = ref(new Recipe({
    id: Number(recipeId),
    name: "Példa Recept",
    description: "Ez egy részletes leírás a receptről...",
    time: 45,
    servings: 2,
    author_id: 1,
    created_at: new Date(),
    last_edit: new Date(),
    is_ai_generated: false
}));


recipe.value.ingredients = [
    new Ingredient(1, "Liszt", 500, "g"),
    new Ingredient(2, "Tojás", 2, "db"),
    new Ingredient(2, "Lorem", 300, "dkg"),
    new Ingredient(2, "Lorem", 300, "dkg"),
    new Ingredient(2, "Lorem", 300, "dkg"),
    new Ingredient(2, "Lorem", 300, "dkg"),
];

recipe.value.allergies = [
    new Allergy("Glutén", 1)
];
</script>

<template>
    <div class="container py-5" v-if="recipe">
        <p @click="$router.back()" class="mb-4"> <i class="bi bi-arrow-left"></i> Vissza</p>

        <div class="row">
            <div class="col-lg-8">
                <div class="mb-3 recipe-image">
                    <div class="icons">
                        <span><i class="bi bi bi-share"></i></span>
                        <div>
                            <span><i class="bi bi-pencil-square"></i></span>
                            <span><i class="bi bi-bookmark-plus"></i></span>
                        </div>
                    </div>
                    <img src="/images/background.webp" class="img-fluid rounded w-100 h-100" />
                </div>
                <div class="recipe-description">
                    <h3>{{ recipe.name }}</h3>
                    <p>{{ recipe.description }}</p>

                    <div class="d-flex gap-3 mb-3">
                        <span><i class="bi bi-clock"></i> {{ recipe.time }} perc</span>
                        <span><i class="bi bi-people"></i> {{ recipe.servings }} fő</span>
                    </div>
                </div>
            </div>

            <div class="col-lg-4">
                <div class="col-lg-12 col-md-12 col-sm-12 moreRecipeBtn">
                    <ClientOnly>
                        <Button :color="buttonColor" iconPosition="right" class="w-100 mb-3">Kipróbálatlan</Button>
                        <Button to="/recipes" :color="buttonColor" outline class="mb-3" icon="bi bi-plus-circle"
                            iconPosition="left">Hozzáadás menühöz...</Button>
                    </ClientOnly>
                </div>

                <div class="ingredient-list mt-5">
                    <h3 class="text-center">Hozzávalók</h3>
                    <ul class="px-5">
                        <li v-for="ingredient in recipe.ingredients" class="border-bottom d-flex p-0">
                            <p>{{ ingredient.name }}</p>
                            <p> {{ ingredient.amount }} {{ ingredient.unit }} </p>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .ingredient-list li{
        justify-content: space-between;
        align-content: center!important;
    }

    .ingredient-list  p{
       margin: 10px 0px;
    }

    .recipe-image .icons i{
        position:relative;
        top: 55px;
        margin: 10px;
    }
    .recipe-image .icons{
      display: flex;
      justify-content: space-between;
    }

 .recipe-image i {
    font-size: var(--nav-icon-size);
    padding: 6px 12px;
    background: var(--grad-yellow);
    border-radius: var(--radius-rounded);
    box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.5);
 }

 .recipe-image img{
    z-index: 1;
    box-shadow: 0 0 20px 20px -20px rgba(0,0,0,0.8)!important;
 }
  
</style>