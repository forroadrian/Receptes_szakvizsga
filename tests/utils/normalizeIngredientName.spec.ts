import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import normalizeIngredientName from '~/utils/normalizeIngredientName'

describe('normalizeIngredientName', () => {
    beforeAll(() => {
        vi.spyOn(console, 'log').mockImplementation(() => {})
    })

    afterAll(() => {
        vi.restoreAllMocks()
    })

    it.each([
        ['alma',          'Alma'],
        ['ALMA',          'Alma'],
        ['  alma  ',      'Alma'],
        ['Banana',        'Banana'],
        ['körte',         'Körte'],
        ['élet',          'Élet'],
        ['kétszersült',   'Kétszersült'],
        ['alma banana',   'Alma banana'],
    ])('normalizes %j to %j', (input, expected) => {
        expect(normalizeIngredientName(input)).toBe(expected)
    })

    it('handles the empty string without throwing', () => {
        expect(normalizeIngredientName('')).toBe('')
    })

    it('handles whitespace-only input as empty', () => {
        expect(normalizeIngredientName('   ')).toBe('')
    })

    it('leaves a leading non-letter character untouched', () => {
        expect(normalizeIngredientName('1kg liszt')).toBe('1kg liszt')
    })
})
