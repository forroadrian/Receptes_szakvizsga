<script setup>
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
    description: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
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
        <p @click="$router.back()" class="mb-5 p-0"> <i class="bi bi-arrow-left"></i> Vissza</p>

        <div class="row">
            <div class="col-lg-8">
                <div class="recipe-image">
                    <div class="icons d-flex w-100">
                        <span><i class="bi bi bi-share"></i></span>
                        <div>
                            <span><i class="bi bi-pencil-square"></i></span>
                            <span><i class="bi bi-bookmark-plus"></i></span>
                        </div>
                    </div>
                    <img src="/images/background.webp" class="img-fluid rounded w-100 h-100" />
                </div>
                <div class="recipe-description ms-lg-2 my-5">
                    <h3>{{ recipe.name }}</h3>
                    <p>{{ recipe.description }}</p>

                    <div class="d-flex gap-5 recipe-meta-data">
                        <span><i class="bi bi-clock me-1"></i> {{ recipe.time }} perc</span>
                        <span><i class="bi bi-people me-2"></i> {{ recipe.servings }} fő</span>
                    </div>
                </div>

                <div class="steps ms-lg-2">
                    <h3 class="mb-3 mt-5">Elkészítés</h3>
                    <div class="step d-flex flex-column flex-lg-row align-items-center mb-3">
                        <p class="circle flex-shrink-0"><span>1</span></p>
                        <p class="ms-lg-3">Lorem ipsum dolor sit amet consectetur, adipisicing elit. Iusto, at
                            exercitationem voluptates quos sit officia ducimus cumque illum dignissimos saepe facilis
                            explicabo.</p>
                    </div>

                    <div class="step d-flex flex-column flex-lg-row align-items-center mb-3">
                        <p class="circle flex-shrink-0"><span>2</span></p>
                        <p class="ms-lg-3">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ea, aspernatur.</p>
                    </div>

                    <div class="step d-flex flex-column flex-lg-row align-items-center mb-3">
                        <p class="circle flex-shrink-0"><span>10</span></p>
                        <p class="ms-lg-3">Lorem ipsum dolor sit amet consectetur adipisicing elit. Laudantium
                            blanditiis adipisci vitae, accusantium mollitia id nemo vel quod sapiente repellendus.</p>
                    </div>
                </div>
            </div>

            <div class="col-lg-4 px-5">
                <div class="col-lg-12 col-md-12 col-sm-12 moreRecipeBtn">
                    <ClientOnly>
                        <Button :color="buttonColor" iconPosition="right" class="w-100 mb-3"
                            outline>Kipróbálatlan</Button>
                        <Button to="/recipes" color="green" class="mb-3" icon="bi bi-plus-circle"
                            iconPosition="left">Hozzáadás menühöz...</Button>
                    </ClientOnly>
                </div>

                <div class="ingredient-list mt-5">
                    <h3 class="text-center">Hozzávalók</h3>
                    <ul class="p-0">
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
.ingredient-list li,
.recipe-image .icons {
    justify-content: space-between;
    align-content: center !important;
}

.ingredient-list p {
    margin: 10px 0px;
}

.recipe-image {
    position: relative;
}

.recipe-image::before {
    content: "";
    position: absolute;
    inset: 0 0 auto 0;
    height: 100px;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6), transparent);
}

.recipe-image .icons {
    position: absolute;
    top: 20px;
    left: 0px;
}

.recipe-image i {
    padding: 6px 12px;
    margin: 10px;
}

.recipe-image i,
.step .circle {
    font-size: var(--nav-icon-size);
    border-radius: var(--radius-rounded);
    background: var(--grad-yellow);
    color: var(--text-dark);
    font-weight: 600;
    box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.5);
}

.step .circle {
    width: var(--large-icon-size);
    height: var(--large-icon-size);
    padding: 5px 0px;
}

.step .circle span {
    display: flex;
    justify-content: center;
}

li {
    margin: 40px !important;
}

.recipe-image img {
    box-shadow: 0 0 20px 20px -20px rgba(0, 0, 0, 0.8) !important;
}

@media (max-width: 992px) {

    .steps,
    .recipe-description,
    .recipe-meta-data {
        text-align: center;
        justify-content: center;
    }

    .step {
        padding: 20px 40px;

    }
}
</style>