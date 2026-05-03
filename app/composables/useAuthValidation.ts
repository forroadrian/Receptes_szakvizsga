export const useAuthValidation = () => {
    const { t } = useI18n()

    const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    }

    const validatePasswordResetRequest = (email: string) => {
        const trimmedEmail = email.trim().toLowerCase()

        if (!trimmedEmail) {
            return t('auth.validation.emailRequired')
        }

        if (!isValidEmail(trimmedEmail)) {
            return t('auth.validation.emailInvalid')
        }

        return ''
    }

    const validatePasswordReset = (password: string, repassword = '') => {
        const trimmedPassword = password.trim()

        if (!trimmedPassword) {
            return t('auth.validation.newPasswordRequired')
        }

        if (trimmedPassword.length < 6) {
            return t('auth.validation.passwordTooShort')
        }

        if (repassword && password !== repassword) {
            return t('auth.validation.passwordMismatch')
        }

        return ''
    }

    return {
        isValidEmail,
        validatePasswordResetRequest,
        validatePasswordReset
    }
}
