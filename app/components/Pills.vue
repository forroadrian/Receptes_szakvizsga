<script setup lang="ts">
import type Pill from '~/interfaces/Pill';

const model = defineModel()

const emit = defineEmits(['chose', 'remove'])

const props = withDefaults(
    defineProps<{
        pills: Pill[],
        interactive?: boolean,
        modelValue?: number | number[] | null,
        icon?: string,
        size?: string,
        removable?: boolean,
        multi?: boolean,
        allActive?: boolean
    }>(),
    {
        interactive: false,
        modelValue: null,
        icon: "bi-tag-fill",
        removable: false,
        multi: false,
        allActive: false
    }
);

const isActive = (id: number): boolean => {
    if (props.multi && Array.isArray(model.value)) {
        return model.value.includes(id);
    }
    return model.value === id;
};

const handleClick = (id: number) => {
    if (!props.interactive) return;

    if (props.multi) {
        const current = Array.isArray(model.value) ? [...model.value] : [];
        const index = current.indexOf(id);
        if (index === -1) {
            current.push(id);
        } else {
            current.splice(index, 1);
        }
        model.value = current;
        emit('chose', current);
        return;
    }

    if (props.modelValue === undefined) {
        emit('chose', id);
        model.value = null;
        return;
    }

    model.value = props.modelValue === id ? null : id;
    emit('chose', model.value);
};

const handleRemove = (id: number) => {
    emit('remove', id);
};
</script>
<template>
    <div class="my-4" :class="{ 'row': size !== undefined, 'd-flex flex-wrap categories gap-2': size === undefined }">
        <Pill v-for="pill in pills" :key="pill.identifier" :pill="pill" :interactive="interactive"
            :active="allActive ? allActive :  isActive(pill.identifier)" :icon="icon" :size="size" :removable="removable"
            @click="handleClick(pill.identifier)" @remove="handleRemove(pill.identifier)" />
    </div>
</template>

<style scoped>
@media (max-width: 992px) {
    .categories {
        display: flex;
        justify-content: center;
    }
}
</style>