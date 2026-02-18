<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    },
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

const emit = defineEmits(['update:modelValue']);

const updateValue = (inputEvent) => {
    const newValue = inputEvent.target.value;
    emit('update:modelValue', newValue);
}

</script>

<template>
    <div class="mb-3">
        <label v-if="label" class="form-label">{{ label }}</label>
        <input class="form-control" :type="type" :placeholder="placeholder" :required="required" :value="modelValue"
            @input="updateValue">
    </div>
</template>