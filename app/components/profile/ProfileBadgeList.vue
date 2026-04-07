<script setup>
import {
    computed,
    nextTick,
    onBeforeUnmount,
    onBeforeUpdate,
    onMounted,
    ref,
    watch,
} from 'vue';

const emit = defineEmits(['remove']);

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
    overflowLabel: {
        type: String,
        default: 'További elemek',
    },
});

const listRef = ref(null);
const measureContainerRef = ref(null);
const overflowTriggerRef = ref(null);
const overflowPanelRef = ref(null);
const overflowMeasureRef = ref(null);
const overflowOpen = ref(false);
const measuredVisibleCount = ref(null);
const measureItemRefs = ref([]);
let resizeObserver = null;

const shouldCollapseOnWrap = computed(() => Boolean(props.title));

const getItemLabel = (item) => {
    return typeof item === 'string' ? item : item?.[props.displayKey] || '';
};

const getItemKey = (item, index) => {
    if (typeof item === 'string') {
        return `${item}-${index}`;
    }

    return item?.[props.itemKey] ?? index;
};

const effectiveOverflowLabel = computed(() => {
    if (props.overflowLabel !== 'További elemek') {
        return props.overflowLabel;
    }

    return props.title ? `További ${props.title.toLowerCase()}` : props.overflowLabel;
});

const visibleItemCount = computed(() => {
    if (!shouldCollapseOnWrap.value || measuredVisibleCount.value === null) {
        return props.items.length;
    }

    return Math.min(measuredVisibleCount.value, props.items.length);
});

const visibleItems = computed(() => props.items.slice(0, visibleItemCount.value));
const hiddenItems = computed(() => props.items.slice(visibleItemCount.value));
const hiddenCount = computed(() => hiddenItems.value.length);

const measurementSignature = computed(() => {
    return props.items
        .map((item, index) => `${getItemKey(item, index)}:${getItemLabel(item)}`)
        .join('|');
});

const setMeasureItemRef = (element) => {
    if (element) {
        measureItemRefs.value.push(element);
    }
};

const closeOverflow = () => {
    overflowOpen.value = false;
};

const openOverflow = () => {
    if (!hiddenCount.value) {
        return;
    }

    overflowOpen.value = true;
};

const toggleOverflow = () => {
    if (!hiddenCount.value) {
        return;
    }

    overflowOpen.value = !overflowOpen.value;
};

const onRemove = (item, index) => {
    emit('remove', item, index);
};

const recalculateVisibleItems = async () => {
    if (!import.meta.client) {
        return;
    }

    await nextTick();

    if (!shouldCollapseOnWrap.value || !props.items.length) {
        measuredVisibleCount.value = props.items.length;
        closeOverflow();
        return;
    }

    const container = listRef.value;
    const measureContainer = measureContainerRef.value;

    if (!container || !measureContainer || !measureItemRefs.value.length) {
        measuredVisibleCount.value = props.items.length;
        return;
    }

    const containerWidth = container.clientWidth;

    if (!containerWidth) {
        measuredVisibleCount.value = props.items.length;
        return;
    }

    const measureStyles = window.getComputedStyle(measureContainer);
    const gap = parseFloat(measureStyles.columnGap || measureStyles.gap || '8') || 8;
    const itemWidths = measureItemRefs.value.map((element) => element.offsetWidth);
    const overflowWidth = overflowMeasureRef.value?.offsetWidth || 0;

    let usedWidth = 0;
    let count = 0;

    for (let index = 0; index < itemWidths.length; index += 1) {
        const nextWidth = itemWidths[index] + (count > 0 ? gap : 0);
        const remainingItems = itemWidths.length - index - 1;
        const overflowSpace = remainingItems > 0
            ? overflowWidth + (count >= 0 ? gap : 0)
            : 0;

        if (usedWidth + nextWidth + overflowSpace <= containerWidth || count === 0) {
            usedWidth += nextWidth;
            count += 1;
            continue;
        }

        break;
    }

    measuredVisibleCount.value = count;

    if (!hiddenItems.value.length) {
        closeOverflow();
    }
};

const handleDocumentClick = (event) => {
    const target = event.target;

    if (
        overflowTriggerRef.value?.contains(target)
        || overflowPanelRef.value?.contains(target)
    ) {
        return;
    }

    closeOverflow();
};

const handleDocumentKeydown = (event) => {
    if (event.key === 'Escape') {
        closeOverflow();
    }
};

onBeforeUpdate(() => {
    measureItemRefs.value = [];
});

onMounted(async () => {
    if (!import.meta.client) {
        return;
    }

    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keydown', handleDocumentKeydown);

    resizeObserver = new ResizeObserver(() => {
        recalculateVisibleItems();
    });

    if (listRef.value) {
        resizeObserver.observe(listRef.value);
    }

    await recalculateVisibleItems();
});

onBeforeUnmount(() => {
    if (!import.meta.client) {
        return;
    }

    document.removeEventListener('click', handleDocumentClick);
    document.removeEventListener('keydown', handleDocumentKeydown);
    resizeObserver?.disconnect();
});

watch(measurementSignature, () => {
    recalculateVisibleItems();
});

watch(hiddenCount, (count) => {
    if (!count) {
        closeOverflow();
    }
});
</script>

<template>
    <div>
        <h6 v-if="title" class="mb-2">{{ title }}</h6>

        <div v-if="items.length" class="profile-chip-list-wrap">
            <div ref="listRef" class="d-flex flex-wrap gap-2 align-items-start">
                <span v-for="(item, index) in visibleItems" :key="getItemKey(item, index)"
                    class="badge rounded-pill profile-chip px-3 py-2 d-inline-flex align-items-center gap-2">
                    {{ getItemLabel(item) }}
                    <button type="button" class="chip-btn" @click="onRemove(item, index)">
                        <i class="bi bi-x"></i>
                    </button>
                </span>

                <div v-if="hiddenCount" class="profile-chip-overflow position-relative">
                    <button ref="overflowTriggerRef" type="button"
                        class="badge rounded-pill profile-chip profile-chip-overflow-trigger px-3 py-2 d-inline-flex align-items-center gap-2"
                        :aria-expanded="overflowOpen" :aria-label="`${hiddenCount} további elem megjelenítése`"
                        @click="toggleOverflow">
                        <span class="profile-chip-overflow-count">+{{ hiddenCount }}</span>
                        <span aria-hidden="true">...</span>
                    </button>

                    <div v-if="overflowOpen" ref="overflowPanelRef" class="profile-chip-overflow-panel shadow-lg"
                        role="dialog" :aria-label="effectiveOverflowLabel">
                        <div class="profile-chip-overflow-header">
                            <span>{{ effectiveOverflowLabel }}</span>
                            <span class="profile-chip-overflow-summary">{{ hiddenCount }} db</span>
                        </div>

                        <div class="profile-chip-overflow-list">
                            <span v-for="(item, index) in hiddenItems"
                                :key="getItemKey(item, visibleItems.length + index)"
                                class="badge rounded-pill profile-chip px-3 py-2 d-inline-flex align-items-center gap-2">
                                {{ getItemLabel(item) }}
                                <button type="button" class="chip-btn"
                                    @click="onRemove(item, visibleItems.length + index)">
                                    <i class="bi bi-x"></i>
                                </button>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="shouldCollapseOnWrap" ref="measureContainerRef"
                class="profile-chip-measure-layer d-flex flex-wrap gap-2 align-items-start" aria-hidden="true">
                <span v-for="(item, index) in items" :key="`measure-${getItemKey(item, index)}`"
                    :ref="setMeasureItemRef"
                    class="badge rounded-pill profile-chip px-3 py-2 d-inline-flex align-items-center gap-2">
                    {{ getItemLabel(item) }}
                    <span class="chip-btn">
                        <i class="bi bi-x"></i>
                    </span>
                </span>

                <span ref="overflowMeasureRef"
                    class="badge rounded-pill profile-chip profile-chip-overflow-trigger px-3 py-2 d-inline-flex align-items-center gap-2">
                    <span class="profile-chip-overflow-count">+{{ items.length }}</span>
                    <span aria-hidden="true">...</span>
                </span>
            </div>
        </div>

        <p v-else-if="emptyText" class="text-muted small mb-0">{{ emptyText }}</p>
    </div>
</template>