<script setup lang="ts">
import type SearchBarOptions from '~/interfaces/SearchBarOptions';

const filter = defineModel<string>()
const props = defineProps<SearchBarOptions>()

const input = ref("")

watch(input, () => {
    filter.value = input.value
})

</script>

<template>
    <div class="input-group">
        <span class="input-group-text">
            <i class="bi bi-search"></i>
        </span>
        <input type="text" class="form-control" :placeholder="placeholder" v-model="input">
    </div>
</template>

<style scoped>
.input-group-text {
    background: var(--bs-body-bg);
    border: 1.5px solid var(--bs-border-color);
    border-right: none;
    border-radius: var(--radius-sm) 0 0 var(--radius-sm);
    color: var(--bs-secondary-color);
    font-size: 14px;
}

.form-control {
    border: 1.5px solid var(--bs-border-color);
    border-left: none;
    border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
    background: var(--bs-body-bg);
    color: var(--bs-body-color);
    padding: 10px 14px;
    font-size: 15px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
}

.input-group:focus-within .form-control,
.input-group:focus-within .input-group-text {
    border-color: var(--accent-border);
}

.form-control:focus {
    box-shadow: none;
}

.input-group:focus-within {
    border-radius: var(--radius-sm);
    box-shadow: 0 0 0 3px var(--accent-shadow);
}
</style>