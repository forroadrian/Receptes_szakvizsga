<script setup>
import { computed } from "vue";
import { defineProps } from "vue";

const props = defineProps({
    color: {
        type: String,
        default: "orange",
    },
    outline: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    type: {
        type: String,
        default: "button",
    },
    to: {
        type: [String, Object],
        default: null
    },
    icon: {
        type: String
    },
    iconPosition: {
        type: String
    },
    iconOnly: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(["click"]);

const classes = computed(() => {
    return ["grad", props.color, props.outline ? "outline" : "",];
});

const iconPosition = computed(() => {
    return props.iconPosition === "right" ? "right" : "left";
});

const isLink = computed(() => props.to !== null);

function handleClick(event) {
    if (!props.disabled) {
        emit("click", event);
    }
}
</script>
<template>
    <NuxtLink v-if="isLink" :to="to" :class="classes" @click="handleClick">
        <i v-if="icon && iconPosition === 'left'" :class="icon"></i>

        <span v-if="!iconOnly">
            <slot />
        </span>

        <i v-if="icon && iconPosition === 'right'" :class="icon"></i>
    </NuxtLink>

    <button v-else :type="type" :class="classes" :disabled="disabled" @click="handleClick">
        <i v-if="icon && iconPosition === 'left'" :class="icon"> </i>

        <span v-if="!iconOnly">
            <slot />
        </span>

        <i v-if="icon && iconPosition === 'right'" :class="icon"> </i>
    </button>
</template>

<style scoped>
i {
    font-size: 20px;
    padding: 0px 10px;
}
</style>