import { ref, computed } from "vue";

export class RecipeImageUploader {
    private _imageFile = ref<File | null>(null);
    private _imagePreview = ref<string>("");
    private _existingImageUrl = ref<string>("");
    private _uploading = ref(false);
    private _error = ref("");

    get imageFile() { return this._imageFile; }
    get imagePreview() { return this._imagePreview; }
    get existingImageUrl() { return this._existingImageUrl; }
    get uploading() { return this._uploading; }
    get error() { return this._error; }

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

        const reader = new FileReader();
        reader.onload = (e) => {
            this._imagePreview.value = (e.target?.result as string) ?? "";
        };
        reader.readAsDataURL(file);
    }

    removeImage() {
        this._imageFile.value = null;
        this._imagePreview.value = "";
        this._existingImageUrl.value = "";
        this._error.value = "";
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

            return imageUrl;
        } catch (err: any) {
            this._error.value = err?.data?.message ?? err?.message ?? "Hiba történt a kép feltöltésekor.";
            return null;
        } finally {
            this._uploading.value = false;
        }
    }

    reset() {
        this._imageFile.value = null;
        this._imagePreview.value = "";
        this._existingImageUrl.value = "";
        this._uploading.value = false;
        this._error.value = "";
    }
}

export const useRecipeImageUpload = () => {
    return new RecipeImageUploader();
};