import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useCalendarGrid } from '~/composables/useCalendarGrid'

describe('useCalendarGrid', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date('2026-04-29T10:00:00+02:00'))
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    describe('cells grid', () => {
        it('always produces a 42-cell (6 weeks x 7 days) grid', () => {
            const { cells } = useCalendarGrid({ year: 2026, month: 3 })
            expect(cells.value).toHaveLength(42)
        })

        it('starts the grid on the Monday on or before the 1st of the month', () => {
            const { cells } = useCalendarGrid({ year: 2026, month: 3 })

            const first = cells.value[0]!
            expect(first.date.getDay()).toBe(1)
            expect(first.dateKey).toBe('2026-03-30')
            expect(first.isCurrentMonth).toBe(false)
        })

        it('flags the current day with isToday and marks it as the current month', () => {
            const { cells } = useCalendarGrid({ year: 2026, month: 3 })

            const todayCells = cells.value.filter((c) => c.isToday)
            expect(todayCells).toHaveLength(1)
            expect(todayCells[0]!.dateKey).toBe('2026-04-29')
            expect(todayCells[0]!.isCurrentMonth).toBe(true)
        })

        it('marks Saturdays and Sundays as weekends, weekdays as not', () => {
            const { cells } = useCalendarGrid({ year: 2026, month: 3 })

            const weekendKeys = cells.value
                .filter((c) => c.isWeekend && c.isCurrentMonth)
                .map((c) => c.dateKey)

            expect(weekendKeys).toContain('2026-04-04')
            expect(weekendKeys).toContain('2026-04-05')
            expect(weekendKeys).not.toContain('2026-04-06')
            expect(weekendKeys).not.toContain('2026-04-29')
        })
    })

    describe('navigation', () => {
        it('prevMonth steps back one month within the same year', () => {
            const { year, month, prevMonth } = useCalendarGrid({ year: 2026, month: 3 })

            prevMonth()

            expect(year.value).toBe(2026)
            expect(month.value).toBe(2)
        })

        it('prevMonth wraps from January to the previous December', () => {
            const { year, month, prevMonth } = useCalendarGrid({ year: 2026, month: 0 })

            prevMonth()

            expect(year.value).toBe(2025)
            expect(month.value).toBe(11)
        })

        it('nextMonth wraps from December to the next January', () => {
            const { year, month, nextMonth } = useCalendarGrid({ year: 2026, month: 11 })

            nextMonth()

            expect(year.value).toBe(2027)
            expect(month.value).toBe(0)
        })

        it('goToToday snaps year and month back to the system clock', () => {
            const { year, month, goToToday } = useCalendarGrid({ year: 2020, month: 0 })

            goToToday()

            expect(year.value).toBe(2026)
            expect(month.value).toBe(3)
        })
    })
})
