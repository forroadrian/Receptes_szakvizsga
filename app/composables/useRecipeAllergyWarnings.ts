import { ref, watch } from "vue";

type UserAllergyRow = {
    allergy_id: number;
};

export const useRecipeAllergyWarnings = () => {
    const user = useSupabaseUser();
    const userAllergyIds = ref<number[]>([]);

    const loadUserAllergies = async () => {
        if (!user.value) {
            userAllergyIds.value = [];
            return;
        }

        try {
            const data = await $fetch<UserAllergyRow[]>("/api/preferences/user-allergy", {
                method: "GET"
            });

            userAllergyIds.value = (data ?? []).map(item => Number(item.allergy_id));
        } catch (error) {
            console.error("Nem sikerült betölteni a felhasználó allergiáit:", error);
            userAllergyIds.value = [];
        }
    };

    const getMatchingAllergies = (recipe: any) => {
        return (recipe.allergies ?? []).filter((allergy: any) =>
            userAllergyIds.value.includes(Number(allergy.id))
        );
    };

    const hasAllergyWarning = (recipe: any) => {
        return getMatchingAllergies(recipe).length > 0;
    };

    const getMatchingAllergyNames = (recipe: any) => {
        return getMatchingAllergies(recipe).map((item: any) => item.name).join(", ");
    };

    watch(
        () => user.value?.id,
        async () => {
            await loadUserAllergies();
        },
        { immediate: true }
    );

    return {
        userAllergyIds,
        loadUserAllergies,
        getMatchingAllergies,
        hasAllergyWarning,
        getMatchingAllergyNames
    };
};