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
    }
});

const inputType = computed(() => {
    if (props.type === 'password') {
        return showPassword.value ? 'text' : 'password';
    }
    return props.type;
});

const togglePassword = () => {
    showPassword.value = !showPassword.value;
}
</script>

<template>
    <div class="mb-3">
        <label v-if="label" class="form-label">{{ label }}</label>

        <div class="position-relative d-flex align-items-center">
            <input class="form-control pe-5" v-model="model" :type="inputType" :placeholder="placeholder" :required="required"/>

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
</style>