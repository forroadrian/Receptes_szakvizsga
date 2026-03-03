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


function handleClick(event) {
    if (!props.disabled) {
        emit("click", event);
    }
}
</script>
<template>
    <button :type="type" :class="classes" :disabled="disabled" @click="handleClick">
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