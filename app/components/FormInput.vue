<script setup>
import { ref, computed } from 'vue';

const model = defineModel();
const showPassword = ref(false);

const props = defineProps({
    type: {
        type: String,
        default: 'text'
    },
    label: {
        type: String,
        default: ''
    },
    placeholder: {
        type: String,
        default: ''
    },
    required: {
        type: Boolean,
        default: false
    },
    autocomplete: {
        type: String,
        default: ''
    }
});

const inputType = computed(() => {
    if (props.type === 'password') {
        return showPassword.value ? 'text' : 'password';
    }
    return props.type;
});

const hasValue = computed(() => String(model.value ?? '').length > 0);

const togglePassword = () => {
    showPassword.value = !showPassword.value;
}
</script>

<template>
    <div class="mb-3 floating-group" :class="{ 'has-value': hasValue }">
        <label v-if="label || placeholder" class="form-label floating-label">{{ label || placeholder }}</label>

        <div class="position-relative d-flex align-items-center">
            <input class="form-control pe-5" v-model="model" :type="inputType" :placeholder="label || placeholder" :required="required" :autocomplete="autocomplete || undefined"/>

            <i v-if="type === 'password'"
                :class="showPassword ? 'bi bi-eye password-icon' : 'bi bi-eye-slash password-icon'" @click="togglePassword"></i>
        </div>
    </div>
</template>

<style scoped>
.password-icon {
    position: absolute;
    right: 15px;
    cursor: pointer;
    font-size: 16px;
}

.floating-label {
    transform: translateY(32px);
    transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

.floating-group:focus-within .floating-label,
.floating-group.has-value .floating-label {
    transform: translateY(0);
}

.floating-group:focus-within .form-control::placeholder,
.floating-group.has-value .form-control::placeholder {
    color: transparent;
}

.floating-group .form-control::placeholder {
    transition: color 0.2s ease;
}

.floating-group:not(:focus-within):not(.has-value) .form-control::placeholder {
    transition-delay: 0.12s;
}
</style>