<script setup lang="ts">
import type RecipeConstuctorOptions from '~/interfaces/ModelInterfaces/RecipeConstructorOptions';
import Recipe from '~/models/Recipe';

const month = ref<number>(0)
const year = ref<number>(0)

const ROWS = 5
const PER_ROW = 7

const currentDate = computed(() => new Date(year.value, month.value))
const prevMonth = computed(() => new Date(year.value, month.value,0))
const firstDay = computed(() => currentDate.value.getDay())
const lastDay = computed(() => new Date(year.value, month.value+1,0).getDate())

const onChanged = (p_month: number, p_year: number) => {
    month.value = p_month;
    year.value = p_year;
}

let dayCache = 0;
const calculateCurrentDay = (day: number) => {
    let localCopy = new Date(prevMonth.value)
    localCopy.setDate(prevMonth.value.getDate() - firstDay.value + day+1 )
    dayCache = localCopy.getDate();
    return dayCache
}

const isBleed = (day: number, row: number) => (day > 10 && row == 1) ||(day < 10 && row == 5)

</script>
<template>
    <section class="mb-4">
        <CalendarMonthPicker @changed="onChanged"/>
        <div class="d-flex justify-content-around">
            <p>H</p>
            <p>K</p>
            <p>Sze</p>
            <p>Cs</p>
            <p>P</p>
            <p>Szo</p>
            <p>V</p>
        </div>
        <div class="d-flex justify-content-between" v-for="row in ROWS">
            <CalendarCell v-for="i in PER_ROW" :day="calculateCurrentDay(((row-1)*7)+i)" :weekday="i%7" :overflow="isBleed(dayCache, row)"></CalendarCell>
        </div>
    </section>
</template>
<style scoped>
.cell {
    width: calc(100% / 7);
    min-height: 20%;
}
</style>