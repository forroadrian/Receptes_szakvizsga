import { defineStore } from "pinia";
import type { FreshnessVariants } from "~/interfaces/cardInterfaces/CardGenericInterfaces";
import ExpiryDate from "~/models/ExpiryDate";
import Ingredient from "~/models/Ingredient";

export const useIngredientStore = defineStore("ingredients", () => {
    const ingredients = ref<Ingredient[]>([]);
    const units = getEnumValues("unit");
    const showIngredientModal = ref(false);

    const openIngredientModal = () => showIngredientModal.value = true;
    const closeIngredientModal = () => showIngredientModal.value = false;

    const pushIngredient = (ingredient: Ingredient) => {
        ingredients.value.push(ingredient);
    }

    const fetchIngredients = async () => {
        try {
            const res = await $fetch("/api/ingredient", { method: "GET" })
            return res
        } catch(error) {
            alert(error)
        }
    }

    const loadIngredients = async () => {
        const res = await fetchIngredients()
        if(res?.length != 0 && res != undefined){
            for (const ingredientData of res) {
                const date = new Date(ingredientData.expiry_date)
                const exp_date = new ExpiryDate(date)
                let freshness: FreshnessVariants = exp_date.checkExpiry();
                let ingredient = new Ingredient(
                    ingredientData.ingredient.id, 
                    ingredientData.ingredient.name, 
                    ingredientData.quantity, 
                    ingredientData.unit, 
                    exp_date, 
                    freshness
                );
                pushIngredient(ingredient);
            }
        }
    }

    const removeIngredient = (id: number) => {
        const index = ingredients.value.findIndex((value) => value.id === id)
        if (index !== -1) ingredients.value.splice(index, 1);
        ingredients.value = [...ingredients.value]
    }


    return {
        openIngredientModal,
        closeIngredientModal,
        pushIngredient,
        fetchIngredients,
        loadIngredients,
        removeIngredient,
        showIngredientModal,
        units,
        ingredients
    }
})