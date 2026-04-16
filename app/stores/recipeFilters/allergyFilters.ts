import type { Ref, ComputedRef } from "vue";
import type { Database } from "~/types/database.types";
import type Pill from "~/interfaces/Pill";

type AllergyRow = Database['public']['Tables']['allergy']['Row'];

export const createAllergyFilters = (
    allAllergies: Ref<AllergyRow[]>,
    selectedAllergyIds: Ref<number[]>,
    allergenSearch: Ref<string>
) => {
    const selectedAllergyPills = computed(() => {
        return allAllergies.value
            .filter(allergy => selectedAllergyIds.value.includes(allergy.id))
            .map(allergy => ({
                name: allergy.name,
                identifier: allergy.id
            }));
    });

    const filteredAllergyPills = computed(() => {
        const searchTerm = allergenSearch.value.trim().toLowerCase();
        if (!searchTerm) return [];
        return allAllergies.value
            .filter(allergy => !selectedAllergyIds.value.includes(allergy.id) && 
                              allergy.name.toLowerCase().includes(searchTerm))
            .map(allergy => ({
                name: allergy.name,
                identifier: allergy.id
            }));
    });

    const loadAllergies = async () => {
        try {
            const data = await $fetch<AllergyRow[]>('/api/preferences/allergy', {
                method: 'GET'
            });
            allAllergies.value = data || [];
        } catch (error) {
            console.error("Nem sikerült betölteni az allergia szűrőket.", error);
        }
    };

    return {
        selectedAllergyPills,
        filteredAllergyPills,
        loadAllergies
    };
};
