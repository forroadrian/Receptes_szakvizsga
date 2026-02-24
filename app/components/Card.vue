<script setup lang="ts">
    const props = defineProps({
        orientation: String
    })

    const cardDirection = computed(() => {
        if (props.orientation == "vertical"){
            return "flex-column c-card--vertical"
        }
        return "flex-row c-card--horizontal"
        
    })

</script>

<template>
    <div class="c-card-base d-flex" :class="cardDirection">
        <slot></slot>
    </div>
</template>