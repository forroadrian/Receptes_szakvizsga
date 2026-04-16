import { defineStore } from "pinia";
import type { FreshnessVariants } from "~/interfaces/cardInterfaces/CardGenericInterfaces";
import ExpiryDate from "~/models/ExpiryDate";
import Ingredient from "~/models/Ingredient";

export const useIngredientStore = defineStore("ingredients", () => {
    const ingredients = ref<Ingredient[]>([]);
    const availableIngredients = ref<{ id: number; name: string }[]>([]);
    const units = getEnumValues("unit");
    const showIngredientModal = ref(false);
    const recommended = ref<[{name: string, appears: number}]>();

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
        ingredients.value = [];
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

    const removeIngredient = async (id: number) => {
        const index = ingredients.value.findIndex((value) => value.id === id)
        if (index !== -1) ingredients.value.splice(index, 1);
        ingredients.value = [...ingredients.value]
        try {
            await $fetch('/api/ingredient', {
                method: 'DELETE',
                body: { id }
            })
        } catch (error) {
            throw error
        }
    }

    const loadAvailableIngredients = async () => {
        if (availableIngredients.value.length > 0) return;
        try {
            const res = await $fetch("/api/ingredient/catalog", { method: "GET" });
            if (res) availableIngredients.value = res as { id: number; name: string }[];
        } catch (error) {
            throw error
        }
    }

    const postIngredient = async (newIngredient: Ingredient) => {
        try {
            const res: any = await $fetch('/api/ingredient', {
                method: "POST",
                body: {
                    ingredient_id: newIngredient.id,
                    unit: newIngredient.unit,
                    quantity: newIngredient.quantity,
                    expiry: newIngredient.expiry.value
                }
            })
            return res
        } catch (error) {
            throw error
        }
    }

    const getMissing = async() => {
        const data = await $fetch('/api/ingredient/missing')
        return data;
    }

    return {
        openIngredientModal,
        closeIngredientModal,
        pushIngredient,
        fetchIngredients,
        loadIngredients,
        loadAvailableIngredients,
        removeIngredient,
        postIngredient,
        getMissing,
        showIngredientModal,
        units,
        ingredients,
        availableIngredients
    }
})