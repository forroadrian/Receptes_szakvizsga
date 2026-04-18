<script setup lang="ts">
import type Pill from '~/interfaces/Pill';

const model = defineModel()

const emit = defineEmits(['chose', 'remove'])

const props = withDefaults(
    defineProps<{
        pills: Pill[],
        interactive?: boolean,
        modelValue?: number | null,
        icon?: string,
        size?: string,
        removable?: boolean,
    }>(),
    {
        interactive: false,
        modelValue: null,
        icon: "bi-tag-fill",
        removable: false,
    }
);

const handleClick = (id: number) => {
    if (!props.interactive) return;

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
            :active="model === pill.identifier" :icon="icon" :size="size" :removable="removable"
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
