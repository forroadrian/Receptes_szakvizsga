<script setup lang="ts">
import type Recipe from '~/models/Recipe';


const props = withDefaults(defineProps<{
    active?: boolean,
    day?: number,
    weekday: number,
    overflow?: boolean,
    recipes?: Recipe[]
}>(),{
    active: false,
})

const isWeekend = computed(() => props.weekday == 0 || props.weekday == 6)

</script>
<template>
    <div class="cell border" :class="{'weekend': isWeekend, 'overflow': overflow}">
        <div class="d-flex justify-content-end">
            <p :class="[active ? 'active' : 'inactive']" class="m-2 p-1 day text-left">{{ day }}</p>
        </div>
        <div class="cell-content">
            <Pill v-if="recipes" :pill="{name: recipes.length.toString() + ' menü'}" icon="" interactive class="w-100 mb-3"/>
        </div>    
    </div>
</template>
<style scoped>
.active {
    background-color: var(--pill-primary-strong);
    color: #ffffff;
    border-radius: 100%;
}

.cell:has(>div>p.active) {
    background-color: var(--accent-soft);
    border-top: 3px solid var(--pill-primary-strong) !important;
}

.day {
    padding: 0.16rem 0.64rem !important;
    height: 30px;
    width: 30px;
}

.weekend {
    background-color: #EDEAE6;

}

.overflow {
    background-color: #FAFAF8;
    color: var(--pill-text-light);   
    opacity: 0.75;
}

.tag-pill {
    background-color: var(--accent-soft);
    border: 0.5px solid var(--accent-border);
    color: var(--pill-text)
}

.interactive:hover {
    background-color: rgba(77, 43, 5, 0.356);
}





</style>