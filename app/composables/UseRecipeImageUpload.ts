import { ref, computed, type Ref } from "vue"

type UseRecipeImageUploadOptions = {
    errorMessage: Ref<string>
    loading: Ref<boolean>
    imageUrl: Ref<string>
}

export const useRecipeImageUpload = ({
    errorMessage,
    loading,
    imageUrl
}: UseRecipeImageUploadOptions) => {
    const imageFile = ref<File | null>(null)
    const imagePreview = ref<string>("")
    const wasRemoved = ref(false)

    const displayImageUrl = computed(() => {
        if (imagePreview.value) return imagePreview.value
        if (imageUrl.value) return imageUrl.value
        return ""
    })

    const hasImage = computed(() => !!displayImageUrl.value)

    const setExistingImage = (url: string | null | undefined) => {
        imageUrl.value = url ?? ""
        imageFile.value = null
        imagePreview.value = ""
        wasRemoved.value = false
    }

    const selectFile = (file: File | null) => {
        errorMessage.value = ""

        if (!file) return

        if (!file.type.startsWith("image/")) {
            errorMessage.value = "Only image files are allowed."
            return
        }

        const MAX_SIZE = 5 * 1024 * 1024
        if (file.size > MAX_SIZE) {
            errorMessage.value = "File size must not exceed 5 MB."
            return
        }

        imageFile.value = file
        wasRemoved.value = false

        const reader = new FileReader()
        reader.onload = (e) => {
            imagePreview.value = (e.target?.result as string) ?? ""
        }
        reader.readAsDataURL(file)
    }

    const removeImage = () => {
        const hadExisting = !!imageUrl.value
        imageFile.value = null
        imagePreview.value = ""
        imageUrl.value = ""
        errorMessage.value = ""
        if (hadExisting) {
            wasRemoved.value = true
        }
    }

    const uploadImage = async (recipeId: number): Promise<string | null> => {
        if (!imageFile.value) return null

        loading.value = true
        errorMessage.value = ""

        try {
            const formData = new FormData()
            formData.append("file", imageFile.value)

            const { imageUrl: uploadedUrl } = await $fetch<{ imageUrl: string }>(
                `/api/recipe-image/${recipeId}`,
                { method: "PUT", body: formData }
            )

            imageUrl.value = uploadedUrl
            imageFile.value = null
            imagePreview.value = ""
            wasRemoved.value = false

            return uploadedUrl
        } catch (err: any) {
            errorMessage.value = err?.data?.message ?? err?.message ?? "Failed to upload image."
            return null
        } finally {
            loading.value = false
        }
    }

    const deleteImage = async (recipeId: number): Promise<boolean> => {
        try {
            await $fetch(`/api/recipe-image/${recipeId}`, { method: "DELETE" })
            wasRemoved.value = false
            return true
        } catch {
            return false
        }
    }

    const resetImage = () => {
        imageFile.value = null
        imagePreview.value = ""
        imageUrl.value = ""
        loading.value = false
        errorMessage.value = ""
        wasRemoved.value = false
    }

    return {
        imageFile,
        imagePreview,
        wasRemoved,
        displayImageUrl,
        hasImage,
        setExistingImage,
        selectFile,
        removeImage,
        uploadImage,
        deleteImage,
        resetImage
    }
}