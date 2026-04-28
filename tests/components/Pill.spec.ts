import { mount } from '@vue/test-utils'
import Pill from '~/components/Pill.vue'

const samplePill = { name: 'Vegetáriánus', identifier: 7 }

describe('Pill.vue', () => {
    describe('click handling', () => {
        it('emits "click" when the pill body is clicked', async () => {
            const wrapper = mount(Pill, { props: { pill: samplePill } })

            await wrapper.get('span.tag-pill').trigger('click')

            expect(wrapper.emitted('click')).toHaveLength(1)
            expect(wrapper.emitted('remove')).toBeUndefined()
        })

        it('emits "remove" but NOT "click" when the remove icon is clicked (@click.stop must hold)', async () => {
            const wrapper = mount(Pill, { props: { pill: samplePill, removable: true } })

            await wrapper.get('i.remove-btn').trigger('click')

            expect(wrapper.emitted('remove')).toHaveLength(1)
            expect(wrapper.emitted('click')).toBeUndefined()
        })
    })

    describe('removable rendering', () => {
        it('does not render the remove icon when removable is false (default)', () => {
            const wrapper = mount(Pill, { props: { pill: samplePill } })
            expect(wrapper.find('i.remove-btn').exists()).toBe(false)
        })

        it('renders the remove icon when removable is true', () => {
            const wrapper = mount(Pill, { props: { pill: samplePill, removable: true } })
            expect(wrapper.find('i.remove-btn').exists()).toBe(true)
        })
    })

    describe('class binding (interactive vs static)', () => {
        it('is "static" when neither interactive nor removable is set', () => {
            const wrapper = mount(Pill, { props: { pill: samplePill } })

            const root = wrapper.get('span.tag-pill')
            expect(root.classes()).toContain('static')
            expect(root.classes()).not.toContain('interactive')
        })

        it('is "interactive" when interactive=true', () => {
            const wrapper = mount(Pill, { props: { pill: samplePill, interactive: true } })

            const root = wrapper.get('span.tag-pill')
            expect(root.classes()).toContain('interactive')
            expect(root.classes()).not.toContain('static')
        })

        it('is "interactive" when removable=true alone — removable counts as interactive', () => {
            const wrapper = mount(Pill, { props: { pill: samplePill, removable: true } })

            const root = wrapper.get('span.tag-pill')
            expect(root.classes()).toContain('interactive')
            expect(root.classes()).not.toContain('static')
        })
    })

    describe('class binding (active vs inactive)', () => {
        it('is "inactive" by default', () => {
            const wrapper = mount(Pill, { props: { pill: samplePill } })

            const root = wrapper.get('span.tag-pill')
            expect(root.classes()).toContain('inactive')
            expect(root.classes()).not.toContain('active')
        })

        it('is "active" when active=true', () => {
            const wrapper = mount(Pill, { props: { pill: samplePill, active: true } })

            const root = wrapper.get('span.tag-pill')
            expect(root.classes()).toContain('active')
            expect(root.classes()).not.toContain('inactive')
        })
    })

    describe('icon', () => {
        it('uses the default "bi-tag-fill" icon class when no icon prop is provided', () => {
            const wrapper = mount(Pill, { props: { pill: samplePill } })

            const leadingIcon = wrapper.get('i.bi.me-2')
            expect(leadingIcon.classes()).toContain('bi-tag-fill')
        })

        it('uses the provided icon class when the icon prop is set', () => {
            const wrapper = mount(Pill, { props: { pill: samplePill, icon: 'bi-fire' } })

            const leadingIcon = wrapper.get('i.bi.me-2')
            expect(leadingIcon.classes()).toContain('bi-fire')
            expect(leadingIcon.classes()).not.toContain('bi-tag-fill')
        })
    })

    describe('size class passthrough', () => {
        it('appends the size prop as a class on the root span', () => {
            const wrapper = mount(Pill, { props: { pill: samplePill, size: 'lg' } })

            expect(wrapper.get('span.tag-pill').classes()).toContain('lg')
        })
    })

    describe('content', () => {
        it('renders pill.name as the visible label', () => {
            const wrapper = mount(Pill, { props: { pill: samplePill } })

            expect(wrapper.text()).toContain('Vegetáriánus')
        })
    })
})
