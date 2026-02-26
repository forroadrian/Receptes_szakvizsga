<script setup lang="ts">
const props = defineProps<{
    orientation?: "horizontal" | "vertical",
    variant?: "outline" | "subtle",
    showDivider?: Boolean,
    mediaPosition?: "top" | "topLeft",
    tagPosition?: "above" | "below"
}>()

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
        <div class="d-flex">
            <div v-if="$slots.media">
                <slot name="media"></slot>
            </div>
        </div>

        <div v-if="$slots.badge">
            <slot name="badge"></slot>
        </div>
        <div v-if="$slots.header">
            <slot name="header"></slot>
        </div>
        <div v-if="$slots.body">
            <slot name="body"></slot>
        </div>
        <div v-if="$slots.metadata">
            <slot name="metadata"></slot>
        </div>
        <div v-if="$slots.tags">
            <slot name="tags"></slot>
        </div>
        <div v-if="$slots.footer" :class="divider">
            <slot name="footer"></slot>
        </div>
    </div>
</template>

<style scoped>
.card--base {
    max-width: 300px;
}
</style>
