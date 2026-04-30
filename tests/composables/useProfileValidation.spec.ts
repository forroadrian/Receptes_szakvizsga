import { describe, it, expect } from 'vitest'
import { useProfileValidation } from '~/composables/useProfileValidation'

describe('useProfileValidation', () => {
    const {
        validatePasswordChange,
        validateEmailChange,
        validateDislikedIngredient,
    } = useProfileValidation()

    describe('validatePasswordChange', () => {
        it('rejects when the new password is the same as the current one', () => {
            expect(validatePasswordChange('jelszo123', 'jelszo123', 'jelszo123'))
                .toBe('Az új jelszó nem egyezhet meg a régivel.')
        })

        it('rejects when the two new passwords do not match', () => {
            expect(validatePasswordChange('regi123', 'uj123abc', 'uj123xyz'))
                .toBe('Az új jelszavak nem egyeznek.')
        })

        it('accepts a valid, different, matching new password', () => {
            expect(validatePasswordChange('regiJelszo1', 'ujJelszo1', 'ujJelszo1'))
                .toBe('')
        })
    })

    describe('validateEmailChange', () => {
        it('rejects when the new email is the same as the current one', () => {
            expect(validateEmailChange('user@example.com', 'user@example.com'))
                .toBe('Az új email cím megegyezik a régivel.')
        })
    })

    describe('validateDislikedIngredient', () => {
        it('rejects an ingredient that is already in the existing list (case-insensitive)', () => {
            expect(validateDislikedIngredient('Cukor', [{ name: 'cukor' }]))
                .toBe('Ez az alapanyag már szerepel a listában.')
        })

        it('accepts an ingredient that is not yet in the list', () => {
            expect(validateDislikedIngredient('méz', [{ name: 'cukor' }]))
                .toBe('')
        })
    })
})
