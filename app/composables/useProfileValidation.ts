export const useProfileValidation = () => {
    const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    }

    const validateUsernameChange = (username: string, currentUsername: string) => {
        const trimmedUsername = username.trim()

        if (!trimmedUsername) {
            return 'Add meg a felhasználónevet.'
        }

        if (trimmedUsername.length < 4) {
            return 'A felhasználónév legalább 4 karakter legyen.'
        }

        if (trimmedUsername === currentUsername.trim()) {
            return 'Az új felhasználónév megegyezik a régivel.'
        }

        return ''
    }

    const validateEmailChange = (currentEmail: string, newEmail: string) => {
        const trimmedCurrentEmail = currentEmail.trim().toLowerCase()
        const trimmedNewEmail = newEmail.trim().toLowerCase()

        if (!trimmedCurrentEmail || !trimmedNewEmail) {
            return 'Töltsd ki mindkét email mezőt.'
        }

        if (!isValidEmail(trimmedCurrentEmail) || !isValidEmail(trimmedNewEmail)) {
            return 'Adj meg érvényes email címet.'
        }

        if (trimmedCurrentEmail === trimmedNewEmail) {
            return 'Az új email cím megegyezik a régivel.'
        }

        return ''
    }

    const validatePasswordChange = (
        currentPassword: string,
        newPassword: string,
        confirmPassword: string,
    ) => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            return 'Töltsd ki az összes jelszó mezőt.'
        }

        if (newPassword.length < 6) {
            return 'Az új jelszó legalább 6 karakter legyen.'
        }

        if (currentPassword === newPassword) {
            return 'Az új jelszó nem egyezhet meg a régivel.'
        }

        if (newPassword !== confirmPassword) {
            return 'Az új jelszavak nem egyeznek.'
        }

        return ''
    }

    const validateSelectedAllergies = (selectedAllergies: unknown[]) => {
        if (!selectedAllergies.length) {
            return 'Válassz ki legalább egy allergént a listából.'
        }

        return ''
    }

    const validateDislikedIngredient = (
        ingredient: string,
        existingIngredients: Array<{ name?: string }>,
        selectedIngredients: Array<{ name?: string }> = [],
    ) => {
        const trimmedIngredient = ingredient.trim()

        if (!trimmedIngredient) {
            return 'Add meg a nem kedvelt alapanyag nevét.'
        }

        const alreadyExists = [...existingIngredients, ...selectedIngredients].some(
            (item) => item?.name?.toLowerCase() === trimmedIngredient.toLowerCase(),
        )

        if (alreadyExists) {
            return 'Ez az alapanyag már szerepel a listában.'
        }

        return ''
    }

    const validateSelectedDislikedIngredients = (selectedDislikedIngredients: unknown[]) => {
        if (!selectedDislikedIngredients.length) {
            return 'Válassz ki legalább egy alapanyagot a listából.'
        }

        return ''
    }

    return {
        validateUsernameChange,
        validateEmailChange,
        validatePasswordChange,
        validateSelectedAllergies,
        validateSelectedDislikedIngredients,
        validateDislikedIngredient,
    }
}