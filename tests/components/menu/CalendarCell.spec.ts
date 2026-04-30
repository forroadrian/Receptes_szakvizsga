import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CalendarCell from '~/components/menu/CalendarCell.vue'
import type { CalendarCell as CalendarCellData } from '~/composables/useCalendarGrid'
import type { MenuItem } from '~/stores/menu'

const buildCell = (overrides: Partial<CalendarCellData> = {}): CalendarCellData => ({
    date: new Date('2026-04-29T00:00:00+02:00'),
    dateKey: '2026-04-29',
    dayNumber: 29,
    isCurrentMonth: true,
    isToday: true,
    isWeekend: false,
    ...overrides,
})

const buildMenu = (id: number, name: string | null = `Menü #${id}`): MenuItem => ({
    id,
    user_id: 'u1',
    name,
    planned_date: '2026-04-29T12:00:00+02:00',
    active: true,
    recipes: [],
})

const mountCell = (props: {
    cell?: CalendarCellData
    menus?: MenuItem[]
    missingCount?: number
}) =>
    mount(CalendarCell, {
        props: {
            cell: props.cell ?? buildCell(),
            menus: props.menus ?? [],
            missingCount: props.missingCount,
        },
        global: {
            mocks: {
                $t: (key: string, named?: Record<string, unknown>) =>
                    named ? `${key}:${JSON.stringify(named)}` : key,
            },
        },
    })

describe('menu/CalendarCell.vue', () => {
    describe('day header', () => {
        it('renders the cell day number', () => {
            const wrapper = mountCell({ cell: buildCell({ dayNumber: 17 }) })
            expect(wrapper.get('.day-num').text()).toBe('17')
        })

        it('applies state classes from the cell flags', () => {
            const wrapper = mountCell({
                cell: buildCell({ isToday: true, isWeekend: true, isCurrentMonth: false }),
                menus: [],
            })

            const root = wrapper.get('.cell')
            expect(root.classes()).toEqual(
                expect.arrayContaining(['is-today', 'is-weekend', 'other-month', 'is-empty'])
            )
        })
    })

    describe('missing badge', () => {
        it('hides the badge when missingCount is 0 or absent', () => {
            const wrapper = mountCell({ menus: [buildMenu(1)] })
            expect(wrapper.find('.missing-badge').exists()).toBe(false)
        })

        it('shows the badge with the count when missingCount > 0', () => {
            const wrapper = mountCell({ menus: [buildMenu(1)], missingCount: 3 })

            const badge = wrapper.get('.missing-badge')
            expect(badge.exists()).toBe(true)
            expect(badge.text()).toContain('3')
        })
    })

    describe('menu pills (overflow)', () => {
        it('renders one pill per menu when there are 3 or fewer', () => {
            const wrapper = mountCell({
                menus: [buildMenu(1, 'A'), buildMenu(2, 'B')],
            })

            const pills = wrapper.findAll('.menu-pill')
            expect(pills).toHaveLength(2)
            expect(pills.map((p) => p.text())).toEqual(['A', 'B'])
            expect(wrapper.find('.overflow-pill').exists()).toBe(false)
        })

        it('caps visible pills at 3 and shows an overflow pill for the rest', () => {
            const wrapper = mountCell({
                menus: [
                    buildMenu(1),
                    buildMenu(2),
                    buildMenu(3),
                    buildMenu(4),
                    buildMenu(5),
                ],
            })

            expect(wrapper.findAll('.menu-pill')).toHaveLength(3)
            const overflow = wrapper.get('.overflow-pill')
            expect(overflow.exists()).toBe(true)
            expect(overflow.text()).toContain('"n":2')
        })
    })

    describe('events', () => {
        it('emits "empty-click" with the dateKey when an empty cell is clicked', async () => {
            const wrapper = mountCell({
                cell: buildCell({ dateKey: '2026-04-29' }),
                menus: [],
            })

            await wrapper.get('.cell').trigger('click')

            expect(wrapper.emitted('empty-click')).toEqual([['2026-04-29']])
            expect(wrapper.emitted('menu-click')).toBeUndefined()
        })

        it('does NOT emit "empty-click" when the cell already has menus', async () => {
            const wrapper = mountCell({ menus: [buildMenu(1)] })

            await wrapper.get('.cell').trigger('click')

            expect(wrapper.emitted('empty-click')).toBeUndefined()
        })

        it('emits "menu-click" with the menu id and stops propagation to the cell', async () => {
            const wrapper = mountCell({
                cell: buildCell({ dateKey: '2026-04-29' }),
                menus: [buildMenu(42, 'Lasagne')],
            })

            await wrapper.get('.menu-pill').trigger('click')

            expect(wrapper.emitted('menu-click')).toEqual([[42]])
            expect(wrapper.emitted('empty-click')).toBeUndefined()
        })

        it('emits "overflow-click" with the dateKey when the overflow pill is clicked', async () => {
            const wrapper = mountCell({
                cell: buildCell({ dateKey: '2026-04-29' }),
                menus: [buildMenu(1), buildMenu(2), buildMenu(3), buildMenu(4)],
            })

            await wrapper.get('.overflow-pill').trigger('click')

            expect(wrapper.emitted('overflow-click')).toEqual([['2026-04-29']])
            expect(wrapper.emitted('empty-click')).toBeUndefined()
        })
    })
})
