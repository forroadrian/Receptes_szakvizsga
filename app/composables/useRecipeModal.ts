import { computed, onMounted, reactive, ref } from "vue";
import { useRecipeStore } from "~/stores/recipe";
import { useIngredientStore } from "~/stores/ingredients";

type RecipeIngredientFormItem = {
    ingredient_id: number;
    name: string;
    quantity: number;
    unit: string;
};

const createInitialRecipeState = () => ({
    name: "",
    description: "",
    prepTime: 60,
    servings: 1,
    mealType: null as number | null,
    tags: [] as number[],
    ingredients: [] as RecipeIngredientFormItem[],
    instructions: [] as string[]
});

export function useRecipeModal() {
    const recipeStore = useRecipeStore();
    const ingredientStore = useIngredientStore();
    const user = useSupabaseUser();

    const recipe = ref(createInitialRecipeState());
    const instructionInput = ref("");
    const ingredientSearch = ref("");
    const showIngredientResults = ref(false);
    const selectedIngredientId = ref<number | null>(null);
    const selectedIngredientQuantity = ref(1);
    const selectedIngredientUnit = ref("");
    const isSaving = ref(false);
    const errorMessage = ref("");
    const closeButton = ref<HTMLButtonElement | null>(null);

    onMounted(async () => {
        await Promise.all([
            recipeStore.loadAvailableCategories(),
            ingredientStore.loadAvailableIngredients()
        ]);

        if (!selectedIngredientUnit.value && ingredientStore.units.length > 0) {
            selectedIngredientUnit.value = ingredientStore.units[0];
        }
    });

    const categories = computed(() => recipeStore.getAvailableCategories());
    const availableIngredients = computed(() => ingredientStore.availableIngredients);
    const availableUnits = computed(() => ingredientStore.units);

    const mealTypes = computed(() =>
        categories.value.filter((category) => category.group_type === "meal")
    );

    const tags = computed(() =>
        categories.value.filter((category) => category.group_type === "type")
    );

    const selectedMealType = computed(() =>
        mealTypes.value.find((category) => category.id === recipe.value.mealType) ?? null
    );

    const filteredIngredients = computed(() => {
        const searchValue = ingredientSearch.value.trim().toLowerCase();

        if (!searchValue) {
            return availableIngredients.value.slice(0, 10);
        }

        return availableIngredients.value
            .filter((ingredient) => ingredient.name.toLowerCase().includes(searchValue))
            .slice(0, 12);
    });

    const hasSelectedIngredient = computed(() =>
        availableIngredients.value.some(
            (ingredient) => ingredient.id === selectedIngredientId.value
        )
    );

    function resetIngredientFields() {
        ingredientSearch.value = "";
        selectedIngredientId.value = null;
        selectedIngredientQuantity.value = 1;
        selectedIngredientUnit.value = availableUnits.value[0] ?? "";
        showIngredientResults.value = false;
    }

    function onIngredientSearchFocus() {
        showIngredientResults.value = true;
    }

    function onIngredientSearchInput() {
        selectedIngredientId.value = null;
        showIngredientResults.value = true;
    }

    function selectIngredient(ingredientId: number, ingredientName: string) {
        selectedIngredientId.value = ingredientId;
        ingredientSearch.value = ingredientName;
        showIngredientResults.value = false;
    }

    function addIngredient() {
        const selectedIngredient = availableIngredients.value.find(
            (ingredient) => ingredient.id === selectedIngredientId.value
        );

        if (!selectedIngredient) return;

        recipe.value.ingredients.push({
            ingredient_id: selectedIngredient.id,
            name: selectedIngredient.name,
            quantity: Number(selectedIngredientQuantity.value),
            unit: selectedIngredientUnit.value
        });

        resetIngredientFields();
    }

    function removeIngredient(index: number) {
        recipe.value.ingredients.splice(index, 1);
    }

    function addInstruction() {
        const instruction = instructionInput.value.trim();

        if (!instruction) return;

        recipe.value.instructions.push(instruction);
        instructionInput.value = "";
    }

    function removeInstruction(index: number) {
        recipe.value.instructions.splice(index, 1);
    }

    function toggleTag(tagId: number) {
        if (recipe.value.tags.includes(tagId)) {
            recipe.value.tags = recipe.value.tags.filter(
                (selectedTagId) => selectedTagId !== tagId
            );
            return;
        }

        recipe.value.tags.push(tagId);
    }

    function resetForm() {
        recipe.value = createInitialRecipeState();
        instructionInput.value = "";
        resetIngredientFields();
        errorMessage.value = "";
    }

    return reactive({
        recipe,
        instructionInput, ingredientSearch, showIngredientResults, 
        selectedIngredientId, selectedIngredientQuantity, selectedIngredientUnit,
        isSaving, errorMessage, closeButton,
        mealTypes,tags, selectedMealType,
        availableUnits, filteredIngredients, hasSelectedIngredient,
        onIngredientSearchFocus, onIngredientSearchInput,
        selectIngredient, toggleTag,  resetForm,
        addIngredient, removeIngredient,addInstruction, removeInstruction,
    });
}