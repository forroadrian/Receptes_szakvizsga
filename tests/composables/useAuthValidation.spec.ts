import { describe, it, expect } from 'vitest'
import { useAuthValidation } from '~/composables/useAuthValidation'

describe('useAuthValidation', () => {
    const { isValidEmail, validatePasswordResetRequest, validatePasswordReset } = useAuthValidation()

    describe('isValidEmail', () => {
        it.each([
            ['valid@user.com', true],
            ['  user@x.io  ', true],
            ['nem-email', false],
            ['a@b', false],
            ['', false],
            ['a b@c.com', false],
        ])('isValidEmail(%j) === %s', (input, expected) => {
            expect(isValidEmail(input)).toBe(expected)
        })
    })

    describe('validatePasswordResetRequest', () => {
        it('rejects empty input', () => {
            expect(validatePasswordResetRequest('')).toBe('Add meg az email címed.')
        })

        it('rejects malformed email', () => {
            expect(validatePasswordResetRequest('not-an-email')).toBe('Adj meg érvényes email címet.')
        })

        it('accepts valid email and returns empty string', () => {
            expect(validatePasswordResetRequest('user@example.com')).toBe('')
        })
    })

    describe('validatePasswordReset', () => {
        it('rejects empty password', () => {
            expect(validatePasswordReset('')).toBe('Add meg az új jelszót.')
        })

        it('rejects too-short password', () => {
            expect(validatePasswordReset('Ab1')).toBe('A jelszó legalább 6 karakter legyen.')
        })

        it('rejects mismatching repassword', () => {
            expect(validatePasswordReset('Abcdef1', 'Xyzabc2')).toBe('A két jelszó nem egyezik.')
        })

        it('accepts matching valid passwords', () => {
            expect(validatePasswordReset('Abcdef1', 'Abcdef1')).toBe('')
        })

        it('accepts valid password without repassword check', () => {
            expect(validatePasswordReset('Abcdef1')).toBe('')
        })
    })
})
