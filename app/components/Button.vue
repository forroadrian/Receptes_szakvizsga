<script setup>
import { computed } from "vue";

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
button i,
a i {
    font-size: 20px;
    padding: 0 10px;
}

.outline {
    --outline-grad: var(--grad-orange);
    --outline-color: var(--orange);

    border: 4px solid transparent;
    background:
        linear-gradient(var(--bs-body-bg), var(--bs-body-bg)) padding-box,
        var(--outline-grad) border-box;

    background-origin: border-box;
    background-clip: padding-box, border-box;
    color: var(--outline-color);
}

.outline.orange {
    --outline-grad: var(--grad-orange);
    --outline-color: var(--orange);
}

.outline.yellow {
    --outline-grad: var(--grad-yellow);
    --outline-color: var(--yellow);
}

.outline.green {
    --outline-grad: var(--grad-green);
    --outline-color: var(--green);
}

.outline.dark {
    --outline-grad: var(--grad-dark);
    --outline-color: var(--text-dark);
}

.outline.soft {
    --outline-grad: var(--grad-light);
    --outline-color: var(--text-light);
}

.grad:disabled {
    opacity: .5;
    pointer-events: none;
}


.grad::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transform: translateX(-100%);
}

.grad:hover::after {
    animation: s .6s;
}

@keyframes s {
    to {
        transform: translateX(100%)
    }
}

@media (max-width: 576px) {
    a {
        text-align: center;
        width: 100%;
    }
}
</style>