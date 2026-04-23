
import { ref } from "vue";

const userAllergyIds = ref<number[]>([]);
const allergyWarningsReady = ref(false);

export const useRecipeAllergyWarnings = () => {
    const {t} = useI18n()
    const user = useSupabaseUser();

    const loadUserAllergies = async () => {
        allergyWarningsReady.value = false;

        if (!user.value) {
            userAllergyIds.value = [];
            allergyWarningsReady.value = true;
            return;
        }

        try {
            const response = await $fetch("/api/preferences/user-allergy", {
                method: "GET"
            });

            userAllergyIds.value = [];

            for (const item of response ?? []) {
                userAllergyIds.value.push(Number(item.allergy_id));
            }
        } catch {
            userAllergyIds.value = [];
        }

        allergyWarningsReady.value = true;
    };

    const getMatchingAllergies = (recipe: any) => {
        if (!recipe.allergies?.length) {
            return [];
        }

        return recipe.allergies.filter((allergy: any) => {
            return userAllergyIds.value.includes(Number(allergy.id));
        });
    };

    const hasAllergyWarning = (recipe: any) => {
        return getMatchingAllergies(recipe).length > 0;
    };

    const getMatchingAllergyNames = (recipe: any) => {
        return getMatchingAllergies(recipe)
            .map((allergy: {name: string, id: number}) => t('allergies.' + allergy.id))
            .join(", ");
    };

    return {
        userAllergyIds, allergyWarningsReady,
        loadUserAllergies,
        hasAllergyWarning,
        getMatchingAllergyNames
    };
};