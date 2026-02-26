<script setup lang="ts">
const props = withDefaults(defineProps<{
    orientation?: "horizontal" | "vertical",
    variant?: "outline" | "subtle",
    showDivider?: boolean,
    mediaPosition?: "top" | "topLeft",
    tagPosition?: "above" | "below"
}>(),
{
    orientation: "vertical",
    variant: "outline",
    showDivider: false,
    mediaPosition: "top",
    tagPosition: "below"
})

const cardDirection = computed(() => {
    if (props.orientation == "vertical") {
        return "flex-column c-card--vertical"
    }
    return "flex-row c-card--horizontal"

})

const variantStyle = computed(() => {
    switch (props.variant) {
        case "outline":
            return "border border-2 rounded shadow"

        case "subtle":
            return "border border-1 border-opacity-25 rounded shadow-sm"
        default:
            break;
    }
})

const divider = computed(() => {
    if (props.showDivider) {
        return "border border-top";
    }
})

</script>

<template>
    <div class="card--base d-flex" :class="[cardDirection, variantStyle]">
        <template v-if="mediaPosition == 'top' && $slots.media">
            <div class="card--media-wrapper card--media-top position-relative">
                <slot name="media"></slot>
                <div v-if="$slots.badge" class="card--badge position-absolute top-0 end-0 m-2">
                    <slot name="badge"></slot>
                </div>
            </div>
            <div class="card--content d-flex flex-column flex-grow-1 p-3">  
                <div v-if="tagPosition == 'above' && $slots.tags" class="card--tags mb-2">
                    <slot name="tags"></slot>
                </div>
                <div v-if="$slots.header" class="card--header">
                    <slot name="header"></slot>
                </div>
                <div v-if="$slots.body" class="card--body">
                    <slot name="body"></slot>
                </div>
                <div v-if="$slots.metadata" class="card--metadata">
                    <slot name="metadata"></slot>
                </div>
                <div v-if="tagPosition == 'below' && $slots.tags" class="card--tags mt-2">
                    <slot name="tags"></slot>
                </div>
                <hr class="card--divider my-2" :class="divider">
                <div v-if="$slots.footer" class="card--footer">
                    <slot name="footer"></slot>
                </div>
            </div>
        </template>

        <template v-else-if="mediaPosition == 'topLeft' && $slots.media">
            <div class="card--row d-flex flex-row flex-grow-1">
                <div class="card--media-wrapper card--media-left position-relative">
                    <slot name="media"></slot>
                    <div v-if="$slots.badge" class="card--badge position-absolute top-0 end-0 m-2">
                        <slot name="badge"></slot>
                    </div>
                </div>
                <div class="card--content d-flex flex-column flex-grow-1 p-3">
                    <div v-if="tagPosition == 'above' && $slots.tags" class="card--tags mb-2">
                        <slot name="tags"></slot>
                    </div>
                    <div v-if="$slots.header" class="card--header">
                        <slot name="header"></slot>
                    </div>
                    <div v-if="$slots.body" class="card--body">
                        <slot name="body"></slot>
                    </div>
                    <div v-if="$slots.metadata" class="card--metadata">
                        <slot name="metadata"></slot>
                    </div>
                    <div v-if="tagPosition == 'below' && $slots.tags" class="card--tags mt-2">
                        <slot name="tags"></slot>
                    </div>
                    <hr class="card--divider my-2" :class="divider">
                    <div v-if="$slots.footer" class="card--footer">
                        <slot name="footer"></slot>
                    </div>
                </div>
            </div>
        </template>

        <template v-else>
            <div class="d-flex">
            </div>
            <div v-if="$slots.header">
                <slot name="header"></slot>
            </div>
            <div v-if="$slots.body">
                <slot name="body"></slot>
            </div>
            <div v-if="$slots.footer" :class="divider">
                <slot name="footer"></slot>
            </div>
        </template>

    </div>
</template>

<style scoped>
.card--base {
    max-width: 100%;
    overflow: hidden;
}

.card--media-top {
    width: 100%;
    aspect-ratio: 16/9;
    background-color: #e9ecef;
}

.card--media-left {
    width: 120px;
    min-width: 120px;
    aspect-ratio: 1;
    background-color: #e9ecef;
}

.card--divider {
    border: 0;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    margin-inline: 0;
}
</style>
