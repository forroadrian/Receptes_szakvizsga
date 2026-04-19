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
    const editingIngredientIndex = ref<number | null>(null);
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

    const isEditingIngredient = computed(() => editingIngredientIndex.value !== null);

    const canSubmit = computed(() =>
        Boolean(user.value) &&
        recipe.value.name.trim().length > 0 &&
        recipe.value.description.trim().length > 0 &&
        Number(recipe.value.prepTime) > 0 &&
        Number(recipe.value.servings) > 0
    );

    function resetIngredientFields() {
        ingredientSearch.value = "";
        selectedIngredientId.value = null;
        selectedIngredientQuantity.value = 1;
        selectedIngredientUnit.value = availableUnits.value[0] ?? "";
        showIngredientResults.value = false;
        editingIngredientIndex.value = null;
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

    function addOrUpdateIngredient() {
        const selectedIngredient = availableIngredients.value.find(
            (ingredient) => ingredient.id === selectedIngredientId.value
        );

        if (!selectedIngredient) return;

        const ingredientItem: RecipeIngredientFormItem = {
            ingredient_id: selectedIngredient.id,
            name: selectedIngredient.name,
            quantity: Number(selectedIngredientQuantity.value),
            unit: selectedIngredientUnit.value
        };

        if (editingIngredientIndex.value !== null) {
            recipe.value.ingredients[editingIngredientIndex.value] = ingredientItem;
        } else {
            recipe.value.ingredients.push(ingredientItem);
        }

        resetIngredientFields();
    }

    function editIngredient(index: number) {
        const ingredient = recipe.value.ingredients[index];
        if (!ingredient) return;

        editingIngredientIndex.value = index;
        selectedIngredientId.value = ingredient.ingredient_id;
        ingredientSearch.value = ingredient.name;
        selectedIngredientQuantity.value = ingredient.quantity;
        selectedIngredientUnit.value = ingredient.unit;
        showIngredientResults.value = false;
    }

    function cancelIngredientEdit() {
        resetIngredientFields();
    }

    function removeIngredient(index: number) {
        recipe.value.ingredients.splice(index, 1);

        if (editingIngredientIndex.value === index) {
            resetIngredientFields();
            return;
        }

        if (
            editingIngredientIndex.value !== null &&
            editingIngredientIndex.value > index
        ) {
            editingIngredientIndex.value--;
        }
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

    function getSelectedCategoryIds() {
        const categoryIds: number[] = [];

        if (recipe.value.mealType !== null) {
            categoryIds.push(recipe.value.mealType);
        }

        for (const tagId of recipe.value.tags) {
            if (!categoryIds.includes(tagId)) {
                categoryIds.push(tagId);
            }
        }

        return categoryIds;
    }

    function getRecipeIngredients() {
        return recipe.value.ingredients.map((ingredient) => ({
            ingredient_id: ingredient.ingredient_id,
            quantity: ingredient.quantity,
            unit: ingredient.unit
        }));
    }

    function resetForm() {
        recipe.value = createInitialRecipeState();
        instructionInput.value = "";
        resetIngredientFields();
        errorMessage.value = "";
    }

    async function saveRecipe() {
        errorMessage.value = "";

        if (!user.value) {
            errorMessage.value = "A recept mentéséhez be kell jelentkezned.";
            return;
        }

        if (!canSubmit.value) {
            errorMessage.value = "Töltsd ki a recept nevét, leírását, idejét és az adagok számát.";
            return;
        }

        isSaving.value = true;

        try {
            await recipeStore.createRecipe({
                name: recipe.value.name.trim(),
                description: recipe.value.description.trim(),
                time: Number(recipe.value.prepTime),
                servings: Number(recipe.value.servings),
                category_ids: getSelectedCategoryIds(),
                ingredients: getRecipeIngredients(),
                steps: recipe.value.instructions
            });

            resetForm();
            closeButton.value?.click();
        } catch (error: any) {
            errorMessage.value =
                error?.data?.message ?? error?.message ?? "Nem sikerült menteni a receptet.";
        } finally {
            isSaving.value = false;
        }
    }

    return reactive({
        recipe,
        instructionInput,
        ingredientSearch,
        showIngredientResults,
        selectedIngredientId,
        selectedIngredientQuantity,
        selectedIngredientUnit,
        editingIngredientIndex,
        isEditingIngredient,
        isSaving,
        errorMessage,
        closeButton,
        mealTypes,
        tags,
        selectedMealType,
        availableUnits,
        filteredIngredients,
        hasSelectedIngredient,
        canSubmit,
        onIngredientSearchFocus,
        onIngredientSearchInput,
        selectIngredient,
        addOrUpdateIngredient,
        editIngredient,
        cancelIngredientEdit,
        removeIngredient,
        addInstruction,
        removeInstruction,
        toggleTag,
        resetForm,
        saveRecipe
    });
}