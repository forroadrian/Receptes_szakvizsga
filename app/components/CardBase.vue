<script setup lang="ts">
import { type CardBaseProps } from '~/interfaces/cardInterfaces/CardGenericInterfaces';
const props = withDefaults(defineProps<CardBaseProps>(),
    {
        orientation: "vertical",
        variant: "outline",
        showDivider: false,
        mediaPosition: "top",
        tagPosition: "below",
        mediaClass: '',
        bodyClass: '',
        contentClass: '',
        mediaLeftClass: '',
        mediaTopClass: '',
        tagsClass: '',
        headerClass: '',
        metadataClass: '',
        dividerClass: '',
        footerClass: ''
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
    <div class="card--base d-flex" :class="[cardDirection, variantStyle, $attrs.class]">
        <template v-if="mediaPosition == 'top' && $slots.media">
            <div class="card--media-wrapper card--media-top position-relative rounded-3"
                :class="[mediaClass, mediaTopClass]">
                <slot name="media"></slot>
            </div>
            <div class="card--content d-flex flex-column flex-grow-1 p-3 justify-content-center align-items-center"
                :class="tagsClass">
                <div v-if="tagPosition == 'above' && $slots.tags" class="card--tags mb-2">
                    <slot name="tags"></slot>
                </div>
                <div v-if="$slots.header" class="card--header" :class="headerClass">
                    <slot name="header"></slot>
                </div>
                <div v-if="$slots.body" class="card--body" :class="bodyClass">
                    <slot name="body"></slot>
                </div>
                <div v-if="$slots.metadata" class="card--metadata" :class="metadataClass">
                    <slot name="metadata"></slot>
                </div>
                <div v-if="tagPosition == 'below' && $slots.tags" class="card--tags mt-2" :class="tagsClass">
                    <slot name="tags"></slot>
                </div>
                <hr class="card--divider my-2" :class="[divider, dividerClass]">
                <div v-if="$slots.footer" class="card--footer" :class="footerClass">
                    <slot name="footer"></slot>
                </div>
            </div>
        </template>

        <template v-else-if="mediaPosition == 'topLeft' && $slots.media">
            <div class="card--row d-flex flex-row flex-grow-1">
                <div class="card--media-wrapper card--media-left position-relative"
                    :class="[mediaClass, mediaLeftClass]">
                    <slot name="media"></slot>
                    <div v-if="$slots.badge" class="card--badge position-absolute top-0 end-0 m-2">
                        <slot name="badge"></slot>
                    </div>
                </div>
                <div class="card--content d-flex flex-column flex-grow-1 p-3" :class="contentClass">
                    <div v-if="tagPosition == 'above' && $slots.tags" class="card--tags mb-2" :class="tagsClass">
                        <slot name="tags"></slot>
                    </div>
                    <div v-if="$slots.header" class="card--header" :class="headerClass">
                        <slot name="header"></slot>
                    </div>
                    <div v-if="$slots.body" class="card--body" :class="bodyClass">
                        <slot name="body"></slot>
                    </div>
                    <div v-if="$slots.metadata" class="card--metadata" :class="metadataClass">
                        <slot name="metadata"></slot>
                    </div>
                    <div v-if="tagPosition == 'below' && $slots.tags" class="card--tags mt-2" :class="tagsClass">
                        <slot name="tags"></slot>
                    </div>
                    <hr v-if="divider" class="card--divider my-2" :class="[divider, dividerClass]">
                    <div v-if="$slots.footer" class="card--footer" :class="footerClass">
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
.card--media-top {
    width: 100%;
    aspect-ratio: 16/9;
}

.card--media-left {
    width: 120px;
    min-width: var(--min-image-size);
    aspect-ratio: 1;
}

.card--divider {
    border: 0;
    border-top: 1px solid rgba(0, 0, 0, 0.2) !important;
    margin-inline: 0;
}

.content-settings {
    padding: 0 !important;
    max-height: 80px;
    justify-content: space-evenly;
}

.to-bottom {
    align-self: center;
}

.small-picture {
    max-width: 60px;
    min-width: 0 !important;
}


</style>
