import { ref, watch } from "vue";

export const useRecipeAllergyWarnings = () => {
    const user = useSupabaseUser();
    const userAllergyIds = ref<number[]>([]);

    const loadUserAllergies = async () => {
        if (!user.value) {
            userAllergyIds.value = [];
            return;
        }

        try {
            const response = await $fetch("/api/preferences/user-allergy");
            userAllergyIds.value = [];

            if (response) {
                for (const item of response) {
                    const allergyId = Number(item.allergy_id);
                    userAllergyIds.value.push(allergyId);
                }
            }
        } catch {
            userAllergyIds.value = [];
        }
    };

    const getMatchingAllergies = (recipe: any) => {
        if (!recipe.allergies) return [];

        return recipe.allergies.filter((allergy: any) => {
            const recipeAllergyId = Number(allergy.id);
            return userAllergyIds.value.includes(recipeAllergyId);
        });
    };

    const hasAllergyWarning = (recipe: any) => {
        return getMatchingAllergies(recipe).length > 0;
    };

    const getMatchingAllergyNames = (recipe: any) => {
        const matchingAllergies = getMatchingAllergies(recipe);
        return matchingAllergies.map((allergy: any) => allergy.name).join(", ");
    };

    watch(() => user.value && user.value.id,loadUserAllergies,
        { immediate: true }
    );

    return {
        userAllergyIds,
        hasAllergyWarning,
        getMatchingAllergyNames
    };
};