import { defineStore } from "pinia";
import type { FreshnessVariants } from "~/interfaces/cardInterfaces/CardGenericInterfaces";
import ExpiryDate from "~/models/ExpiryDate";
import Ingredient from "~/models/Ingredient";

type IngredientRow = {
    quantity: number;
    unit: string;
    expiry_date: string;
    ingredient: { id: number; name: string };
};

type PostIngredientResponse = {
    ingredient_id: number;
};

type MissingIngredient = { name: string; appears: number; ingredient_id: number };

export const useIngredientStore = defineStore("ingredients", () => {
    const ingredients = ref<Ingredient[]>([]);
    const availableIngredients = ref<{ id: number; name: string }[]>([]);
    const units = getEnumValues("unit");

    const pushIngredient = (ingredient: Ingredient) => {
        ingredients.value.push(ingredient);
    };

    const loadIngredients = async () => {
        const res = await $fetch<IngredientRow[]>("/api/ingredient", { method: "GET" });
        ingredients.value = (res ?? []).map((row) => {
            const exp_date = new ExpiryDate(new Date(row.expiry_date));
            const freshness: FreshnessVariants = exp_date.checkExpiry();
            return new Ingredient(
                row.ingredient.id,
                row.ingredient.name,
                row.quantity,
                row.unit,
                exp_date,
                freshness,
            );
        });
    };

    const removeIngredient = async (id: number) => {
        await $fetch("/api/ingredient", { method: "DELETE", body: { id } });
        ingredients.value = ingredients.value.filter((v) => v.id !== id);
    };

    const loadAvailableIngredients = async () => {
        if (availableIngredients.value.length > 0) return;
        const res = await $fetch<{ name: string; id: number }[]>("/api/ingredient/catalog", { method: "GET" });
        if (res) availableIngredients.value = res;
    };

    const postIngredient = async (newIngredient: Ingredient) => {
        return await $fetch<PostIngredientResponse>("/api/ingredient", {
            method: "POST",
            body: {
                ingredient_id: newIngredient.id,
                unit: newIngredient.unit,
                quantity: newIngredient.quantity,
                expiry: newIngredient.expiry.value,
            },
        });
    };

    const getMissing = async () => {
        return await $fetch<MissingIngredient[]>("/api/ingredient/missing");
    };

    const updateIngredient = async (prevId: number, updated: Ingredient) => {
        await $fetch("/api/ingredient", {
            method: "PUT",
            body: {
                prev: prevId,
                ingredient_id: updated.id,
                unit: updated.unit,
                quantity: updated.quantity,
                expiry: updated.expiry.value,
            },
        });
        const index = ingredients.value.findIndex((v) => v.id === prevId);
        if (index !== -1) {
            ingredients.value.splice(index, 1, updated);
        }
    };

    return {
        pushIngredient,
        loadIngredients,
        loadAvailableIngredients,
        removeIngredient,
        postIngredient,
        updateIngredient,
        getMissing,
        units,
        ingredients,
        availableIngredients,
    };
});