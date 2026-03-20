export const useAuthValidation = () => {
    const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    }

    const validatePasswordResetRequest = (email: string) => {
        const trimmedEmail = email.trim().toLowerCase()

        if (!trimmedEmail) {
            return 'Add meg az email címed.'
        }

        if (!isValidEmail(trimmedEmail)) {
            return 'Adj meg érvényes email címet.'
        }

        return ''
    }

    const validatePasswordReset = (password: string, repassword = '') => {
        const trimmedPassword = password.trim()

        if (!trimmedPassword) {
            return 'Add meg az új jelszót.'
        }

        if (trimmedPassword.length < 6) {
            return 'A jelszó legalább 6 karakter legyen.'
        }

        if (repassword && password !== repassword) {
            return 'A két jelszó nem egyezik.'
        }

        return ''
    }

    return {
        isValidEmail,
        validatePasswordResetRequest,
        validatePasswordReset
    }
}