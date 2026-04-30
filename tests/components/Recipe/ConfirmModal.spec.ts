import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ConfirmModal from '~/components/recipe/ConfirmModal.vue'

const Button = {
    template: '<button :disabled="$attrs.disabled" @click="$emit(\'click\')"><slot /></button>'
}

const mountModal = (show = true) => {
    return mount(ConfirmModal, {
        props: {
            show,
            confirmLabel: 'Törlés',
            cancelLabel: 'Mégse'
        },
        slots: {
            title: 'Recept törlése',
            message: 'Biztosan törölni szeretnéd?'
        },
        global: {
            stubs: {
                Teleport: true,
                Button
            }
        }
    })
}

describe('ConfirmModal.vue', () => {
    describe('megjelenítés', () => {
        it('megjelenik, ha a show igaz', () => {
            const wrapper = mountModal()

            expect(wrapper.find('.confirm-backdrop').exists()).toBe(true)
            expect(wrapper.text()).toContain('Recept törlése')
            expect(wrapper.text()).toContain('Biztosan törölni szeretnéd?')
        })

        it('nem jelenik meg, ha a show hamis', () => {
            const wrapper = mountModal(false)

            expect(wrapper.find('.confirm-backdrop').exists()).toBe(false)
        })
    })

    describe('események', () => {
        it('cancel eseményt küld a mégse gombra', async () => {
            const wrapper = mountModal()

            const buttons = wrapper.findAll('button')
            await buttons[0]!.trigger('click')

            expect(wrapper.emitted('cancel')).toBeTruthy()
            expect(wrapper.emitted('confirm')).toBeUndefined()
        })

        it('confirm eseményt küld a törlés gombra', async () => {
            const wrapper = mountModal()

            const buttons = wrapper.findAll('button')
            await buttons[1]!.trigger('click')

            expect(wrapper.emitted('confirm')).toBeTruthy()
            expect(wrapper.emitted('cancel')).toBeUndefined()
        })

        it('cancel eseményt küld a háttérre kattintva', async () => {
            const wrapper = mountModal()

            await wrapper.get('.confirm-backdrop').trigger('click')

            expect(wrapper.emitted('cancel')).toHaveLength(1)
        })
    })
})
