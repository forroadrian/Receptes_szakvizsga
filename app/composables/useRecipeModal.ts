import { computed, onMounted, ref } from "vue";
import { defineStore } from "pinia";
import { useRecipeStore, type RecipeItem } from "~/stores/recipe";
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

export const useRecipeModal = defineStore("recipeModal", () => {
    const recipeStore = useRecipeStore();
    const ingredientStore = useIngredientStore();
    const user = useSupabaseUser();
    const { showAlert } = useAlert();

    const recipe = ref(createInitialRecipeState());
    const editingRecipeId = ref<number | null>(null);
    const instructionInput = ref("");
    const ingredientSearch = ref("");
    const showIngredientResults = ref(false);
    const selectedIngredientId = ref<number | null>(null);
    const selectedIngredientQuantity = ref(1);
    const selectedIngredientUnit = ref("");
    const editingIngredientIndex = ref<number | null>(null);
    const editingInstructionIndex = ref<number | null>(null);
    const isSaving = ref(false);
    const errorMessage = ref("");
    const closeButton = ref<HTMLButtonElement | null>(null);

    const isEditMode = computed(() => editingRecipeId.value !== null);

    const categories = computed(() => recipeStore.getAvailableCategories());
    const availableIngredients = computed(() => ingredientStore.availableIngredients);
    const availableUnits = computed(() => ingredientStore.units);
    const mealTypes = computed(() => categories.value.filter(c => c.group_type === "meal"));
    const tags = computed(() => categories.value.filter(c => c.group_type === "type"));
    const selectedMealType = computed(() => mealTypes.value.find(c => c.id === recipe.value.mealType) ?? null);

    const filteredIngredients = computed(() => {
        const q = ingredientSearch.value.trim().toLowerCase();
        if (!q) return availableIngredients.value.slice(0, 10);
        return availableIngredients.value.filter(i => i.name.toLowerCase().includes(q)).slice(0, 12);
    });

    const hasSelectedIngredient = computed(() =>
        availableIngredients.value.some(i => i.id === selectedIngredientId.value)
    );

    const isEditingIngredient = computed(() => editingIngredientIndex.value !== null);
    const isEditingInstruction = computed(() => editingInstructionIndex.value !== null);

    const canSubmit = computed(() =>
        Boolean(user.value) &&
        recipe.value.name.trim().length > 0 &&
        recipe.value.description.trim().length > 0 &&
        Number(recipe.value.prepTime) > 0 &&
        Number(recipe.value.servings) > 0
    );

    async function init() {
        await Promise.all([
            recipeStore.loadAvailableCategories(),
            ingredientStore.loadAvailableIngredients()
        ]);
        if (!selectedIngredientUnit.value && ingredientStore.units.length > 0) {
            selectedIngredientUnit.value = ingredientStore.units[0];
        }
    }

    function openEditRecipe(recipeItem: RecipeItem) {
        editingRecipeId.value = recipeItem.id;
        const mealCategory = recipeItem.categories.find(c => c.group_type === "meal");
        recipe.value = {
            name: recipeItem.name,
            description: recipeItem.description,
            prepTime: recipeItem.time,
            servings: recipeItem.servings,
            mealType: mealCategory?.id ?? null,
            tags: recipeItem.categories.filter(c => c.group_type === "type").map(c => c.id),
            ingredients: recipeItem.ingredients.map(i => ({
                ingredient_id: i.id,
                name: i.name,
                quantity: i.quantity,
                unit: i.unit
            })),
            instructions: [...recipeItem.steps]
        };
    }

    function resetIngredientFields() {
        ingredientSearch.value = "";
        selectedIngredientId.value = null;
        selectedIngredientQuantity.value = 1;
        selectedIngredientUnit.value = availableUnits.value[0] ?? "";
        showIngredientResults.value = false;
        editingIngredientIndex.value = null;
    }

    function onIngredientSearchFocus() { showIngredientResults.value = true; }
    function onIngredientSearchInput() { selectedIngredientId.value = null; showIngredientResults.value = true; }

    function selectIngredient(id: number, name: string) {
        selectedIngredientId.value = id;
        ingredientSearch.value = name;
        showIngredientResults.value = false;
        const existing = recipe.value.ingredients.find(i => i.ingredient_id === id);
        if (existing) selectedIngredientUnit.value = existing.unit;
    }

    function addOrUpdateIngredient() {
        const selected = availableIngredients.value.find(i => i.id === selectedIngredientId.value);
        if (!selected) return;

        const item: RecipeIngredientFormItem = {
            ingredient_id: selected.id,
            name: selected.name,
            quantity: Number(selectedIngredientQuantity.value),
            unit: selectedIngredientUnit.value
        };

        const othersWithDiffUnit = recipe.value.ingredients
            .filter((_, i) => i !== editingIngredientIndex.value)
            .find(i => i.ingredient_id === item.ingredient_id && i.unit !== item.unit);

        if (othersWithDiffUnit) {
            showAlert("danger", `${item.name} már hozzá lett adva ${othersWithDiffUnit.unit} mértékegységgel.`);
            return;
        }

        if (editingIngredientIndex.value !== null) recipe.value.ingredients.splice(editingIngredientIndex.value, 1);

        const existing = recipe.value.ingredients.find(i => i.ingredient_id === item.ingredient_id && i.unit === item.unit);
        if (existing) {
            existing.quantity = Math.round((existing.quantity + item.quantity) * 1000) / 1000;
        } else {
            recipe.value.ingredients.push(item);
        }

        resetIngredientFields();
    }

    function editIngredient(index: number) {
        const ing = recipe.value.ingredients[index];
        if (!ing) return;
        editingIngredientIndex.value = index;
        selectedIngredientId.value = ing.ingredient_id;
        ingredientSearch.value = ing.name;
        selectedIngredientQuantity.value = ing.quantity;
        selectedIngredientUnit.value = ing.unit;
        showIngredientResults.value = false;
    }

    function cancelIngredientEdit() { resetIngredientFields(); }

    function removeIngredient(index: number) {
        recipe.value.ingredients.splice(index, 1);
        if (editingIngredientIndex.value === index) { resetIngredientFields(); return; }
        if (editingIngredientIndex.value !== null && editingIngredientIndex.value > index) editingIngredientIndex.value--;
    }

    function addOrUpdateInstruction() {
        const instruction = instructionInput.value.trim();
        if (!instruction) return;
        if (editingInstructionIndex.value !== null) {
            recipe.value.instructions[editingInstructionIndex.value] = instruction;
        } else {
            recipe.value.instructions.push(instruction);
        }
        instructionInput.value = "";
        editingInstructionIndex.value = null;
    }

    function editInstruction(index: number) {
        const instruction = recipe.value.instructions[index];
        if (!instruction) return;
        instructionInput.value = instruction;
        editingInstructionIndex.value = index;
    }

    function cancelInstructionEdit() { instructionInput.value = ""; editingInstructionIndex.value = null; }

    function removeInstruction(index: number) {
        recipe.value.instructions.splice(index, 1);
        if (editingInstructionIndex.value === index) { cancelInstructionEdit(); return; }
        if (editingInstructionIndex.value !== null && editingInstructionIndex.value > index) editingInstructionIndex.value--;
    }

    function moveInstructionUp(index: number) {
        const instructions = recipe.value.instructions;
        if (index <= 0) return;
        const a = instructions[index - 1] ?? "";
        const b = instructions[index] ?? "";
        instructions.splice(index - 1, 2, b, a);
    }

    function moveInstructionDown(index: number) {
        const instructions = recipe.value.instructions;
        if (index >= instructions.length - 1) return;
        const a = instructions[index] ?? "";
        const b = instructions[index + 1] ?? "";
        instructions.splice(index, 2, b, a);
    }

    function toggleTag(tagId: number) {
        if (recipe.value.tags.includes(tagId)) {
            recipe.value.tags = recipe.value.tags.filter(id => id !== tagId);
        } else {
            recipe.value.tags.push(tagId);
        }
    }

    function getSelectedCategoryIds() {
        const ids: number[] = [];
        if (recipe.value.mealType !== null) ids.push(recipe.value.mealType);
        for (const tagId of recipe.value.tags) { if (!ids.includes(tagId)) ids.push(tagId); }
        return ids;
    }

    function resetForm() {
        recipe.value = createInitialRecipeState();
        editingRecipeId.value = null;
        instructionInput.value = "";
        editingInstructionIndex.value = null;
        resetIngredientFields();
        errorMessage.value = "";
    }

    async function saveRecipe() {
        errorMessage.value = "";
        if (!user.value) { errorMessage.value = "A recept mentéséhez be kell jelentkezned."; return; }
        if (!canSubmit.value) { errorMessage.value = "Töltsd ki a recept nevét, leírását, idejét és az adagok számát."; return; }

        isSaving.value = true;

        const payload = {
            name: recipe.value.name.trim(),
            description: recipe.value.description.trim(),
            time: Number(recipe.value.prepTime),
            servings: Number(recipe.value.servings),
            category_ids: getSelectedCategoryIds(),
            ingredients: recipe.value.ingredients.map(i => ({ ingredient_id: i.ingredient_id, quantity: i.quantity, unit: i.unit })),
            steps: recipe.value.instructions
        };

        try {
            if (isEditMode.value) {
                await $fetch(`/api/recipe/${editingRecipeId.value}`, { method: "PUT", body: payload });
                await recipeStore.loadRecipes();
            } else {
                await recipeStore.createRecipe(payload);
            }

            resetForm();
            closeButton.value?.click();
            showAlert("success", isEditMode.value ? "A recept sikeresen frissítve lett." : "A recept sikeresen mentve lett.");
        } catch (error: any) {
            errorMessage.value = error?.data?.message ?? error?.message ?? "Nem sikerült menteni a receptet.";
            showAlert("danger", errorMessage.value);
        } finally {
            isSaving.value = false;
        }
    }

    return {
        recipe, editingRecipeId, isEditMode,
        instructionInput, ingredientSearch, showIngredientResults,
        selectedIngredientId, selectedIngredientQuantity, selectedIngredientUnit,
        editingIngredientIndex, isEditingIngredient,
        editingInstructionIndex, isEditingInstruction,
        isSaving, errorMessage, closeButton,
        mealTypes, tags, selectedMealType,
        availableUnits, filteredIngredients, hasSelectedIngredient, canSubmit,
        init, openEditRecipe, resetForm, saveRecipe,
        onIngredientSearchFocus, onIngredientSearchInput, selectIngredient,
        addOrUpdateIngredient, editIngredient, cancelIngredientEdit, removeIngredient,
        addOrUpdateInstruction, editInstruction, cancelInstructionEdit, removeInstruction,
        moveInstructionUp, moveInstructionDown, toggleTag
    };
});