import { ref, computed } from "vue";

export class RecipeImageUploader {
    private _imageFile = ref<File | null>(null);
    private _imagePreview = ref<string>("");
    private _existingImageUrl = ref<string>("");
    private _uploading = ref(false);
    private _error = ref("");
    private _wasRemoved = ref(false);

    get imageFile() { return this._imageFile; }
    get imagePreview() { return this._imagePreview; }
    get existingImageUrl() { return this._existingImageUrl; }
    get uploading() { return this._uploading; }
    get error() { return this._error; }
    get wasRemoved() { return this._wasRemoved; }

    readonly displayImageUrl = computed(() => {
        if (this._imagePreview.value) return this._imagePreview.value;
        if (this._existingImageUrl.value) return this._existingImageUrl.value;
        return "";
    });

    readonly hasImage = computed(() => !!this.displayImageUrl.value);

    setExistingImage(url: string | null | undefined) {
        this._existingImageUrl.value = url ?? "";
        this._imageFile.value = null;
        this._imagePreview.value = "";
        this._wasRemoved.value = false;
    }

    selectFile(file: File | null) {
        this._error.value = "";

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            this._error.value = "Csak képfájl tölthető fel.";
            return;
        }

        const MAX_SIZE = 5 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            this._error.value = "A fájl mérete nem lehet nagyobb 5MB-nál.";
            return;
        }

        this._imageFile.value = file;
        this._wasRemoved.value = false;

        const reader = new FileReader();
        reader.onload = (e) => {
            this._imagePreview.value = (e.target?.result as string) ?? "";
        };
        reader.readAsDataURL(file);
    }

    removeImage() {
        const hadExisting = !!this._existingImageUrl.value;
        this._imageFile.value = null;
        this._imagePreview.value = "";
        this._existingImageUrl.value = "";
        this._error.value = "";
        if (hadExisting) {
            this._wasRemoved.value = true;
        }
    }

    async upload(recipeId: number): Promise<string | null> {
        if (!this._imageFile.value) return null;

        this._uploading.value = true;
        this._error.value = "";

        try {
            const formData = new FormData();
            formData.append("file", this._imageFile.value);

            const { imageUrl } = await $fetch<{ imageUrl: string }>(
                `/api/recipe-image/${recipeId}`,
                { method: "PUT", body: formData }
            );

            this._existingImageUrl.value = imageUrl;
            this._imageFile.value = null;
            this._imagePreview.value = "";
            this._wasRemoved.value = false;

            return imageUrl;
        } catch (err: any) {
            this._error.value = err?.data?.message ?? err?.message ?? "Hiba történt a kép feltöltésekor.";
            return null;
        } finally {
            this._uploading.value = false;
        }
    }

    async deleteImage(recipeId: number): Promise<boolean> {
        try {
            await $fetch(`/api/recipe-image/${recipeId}`, { method: "DELETE" });
            this._wasRemoved.value = false;
            return true;
        } catch {
            return false;
        }
    }

    reset() {
        this._imageFile.value = null;
        this._imagePreview.value = "";
        this._existingImageUrl.value = "";
        this._uploading.value = false;
        this._error.value = "";
        this._wasRemoved.value = false;
    }
}

export const useRecipeImageUpload = () => {
    return new RecipeImageUploader();
};