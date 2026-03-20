<script setup>
defineEmits(['remove']);

const props = defineProps({
    title: {
        type: String,
        default: '',
    },
    items: {
        type: Array,
        required: true,
    },
    displayKey: {
        type: String,
        default: 'name',
    },
    itemKey: {
        type: String,
        default: 'id',
    },
    emptyText: {
        type: String,
        default: '',
    },
});

const getItemLabel = (item) => {
    return typeof item === 'string' ? item : item?.[props.displayKey] || '';
}

const getItemKey = (item, index) => {
    if (typeof item === 'string') {
        return `${item}-${index}`;
    }

    return item?.[props.itemKey] ?? index;
}
</script>

<template>
    <div>
        <h6 v-if="title" class="mb-2">{{ title }}</h6>

        <div v-if="items.length" class="d-flex flex-wrap gap-2">
            <span v-for="(item, index) in items" :key="getItemKey(item, index)"
                class="badge rounded-pill text-bg-dark px-3 py-2 d-inline-flex align-items-center gap-2">
                {{ getItemLabel(item) }}
                <button type="button" class="chip-btn" @click="$emit('remove', item, index)">
                    <i class="bi bi-x"></i>
                </button>
            </span>
        </div>

        <p v-else-if="emptyText" class="text-muted small mb-0">{{ emptyText }}</p>
    </div>
</template>