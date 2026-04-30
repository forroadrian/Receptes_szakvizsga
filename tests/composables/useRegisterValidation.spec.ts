import { describe, it, expect } from 'vitest'
import { useRegisterValidation } from '~/composables/useRegisterValidation'

describe('useRegisterValidation', () => {
    const { isUsernameOk, isPasswordOk, doPasswordsMatch } = useRegisterValidation()

    describe('isUsernameOk', () => {
        it('returns false when the username is shorter than 4 characters', () => {
            expect(isUsernameOk('abc')).toBe(false)
        })

        it('returns true when the username is at least 4 characters', () => {
            expect(isUsernameOk('john')).toBe(true)
        })
    })

    describe('isPasswordOk', () => {
        it('returns false when the password is shorter than 6 characters', () => {
            expect(isPasswordOk('abc')).toBe(false)
        })

        it('returns true when the password is at least 6 characters', () => {
            expect(isPasswordOk('jelszo')).toBe(true)
        })
    })

    describe('doPasswordsMatch', () => {
        it('returns false when the two passwords differ', () => {
            expect(doPasswordsMatch('jelszo123', 'jelszo456')).toBe(false)
        })

        it('returns true when the two passwords are identical', () => {
            expect(doPasswordsMatch('jelszo123', 'jelszo123')).toBe(true)
        })
    })
})
