import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import StatCards from '~/components/Ingredient/StatCards.vue'

const FILTERS = ['Összes', 'Friss', 'Hamarosan', 'Lejárt'] as const

describe('Ingredient/StatCards.vue', () => {
    describe('rendering', () => {
        it('renders one button per filter (Összes, Friss, Hamarosan, Lejárt)', () => {
            const wrapper = mount(StatCards)

            const buttons = wrapper.findAll('button.seg-btn')
            expect(buttons).toHaveLength(FILTERS.length)
            expect(buttons.map((b) => b.text())).toEqual(
                FILTERS.map((name, i) => `${name}${[0, 0, 0, 0][i]}`)
            )
        })

        it('shows the supplied counts in the count badge of each segment', () => {
            const wrapper = mount(StatCards, {
                props: { all: 12, fresh: 7, almostExpired: 3, expired: 2 },
            })

            const counts = wrapper.findAll('strong.seg-count').map((el) => el.text())
            expect(counts).toEqual(['12', '7', '3', '2'])
        })

        it('falls back to 0 for any count prop that is omitted', () => {
            const wrapper = mount(StatCards, { props: { all: 5 } })

            const counts = wrapper.findAll('strong.seg-count').map((el) => el.text())
            expect(counts).toEqual(['5', '0', '0', '0'])
        })
    })

    describe('selection behavior', () => {
        it('starts with the "Összes" segment marked active', () => {
            const wrapper = mount(StatCards)

            const buttons = wrapper.findAll('button.seg-btn')
            expect(buttons[0]!.classes()).toContain('active')
            expect(buttons[1]!.classes()).not.toContain('active')
            expect(buttons[2]!.classes()).not.toContain('active')
            expect(buttons[3]!.classes()).not.toContain('active')
        })

        it('moves the active class to the segment the user clicks', async () => {
            const wrapper = mount(StatCards)

            const buttons = wrapper.findAll('button.seg-btn')
            await buttons[2]!.trigger('click')

            expect(buttons[0]!.classes()).not.toContain('active')
            expect(buttons[2]!.classes()).toContain('active')
        })

        it('emits "filter" with the selected segment name on each click', async () => {
            const wrapper = mount(StatCards)

            const buttons = wrapper.findAll('button.seg-btn')
            await buttons[1]!.trigger('click')
            await buttons[3]!.trigger('click')

            const events = wrapper.emitted('filter')
            expect(events).toHaveLength(2)
            expect(events![0]).toEqual(['Friss'])
            expect(events![1]).toEqual(['Lejárt'])
        })
    })
})
