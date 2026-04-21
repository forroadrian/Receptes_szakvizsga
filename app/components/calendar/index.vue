<script setup lang="ts">

const month = ref(0)
const year = ref(0)
const today = ref(0)

const ROWS = 5
const PER_ROW = 7

const currentDate = computed(() => new Date(year.value, month.value))
const prevMonth = computed(() => new Date(year.value, month.value,0))
const firstDay = computed(() => currentDate.value.getDay() - 1)

const convertedDays = ref<{
    bleed: {
        [index: number]: number
    },
    normal: {
        [index: number]: number
    },
    all : {
        [index: number]: number
    }
}>({
    bleed: {},
    normal: {},
    all: {}
});

const onChanged = (p_month: number, p_year: number) => {
    month.value = p_month;
    year.value = p_year;
    today.value = new Date(Date.now()).getDate();
}

const calculateDays = () => {
    const ALL_DAYS = ROWS * PER_ROW;
    let bleed = true;
    for(let i = 1; i <= ALL_DAYS;i++){
        let localCopy = new Date(prevMonth.value);
        localCopy.setDate(prevMonth.value.getDate() - firstDay.value + i );
        let day = localCopy.getDate();
        if(day == 1){
            bleed = !bleed;
        }
        if(bleed) {
            convertedDays.value["bleed"][i] = day;
        }else {
            convertedDays.value["normal"][i] = day;
        }
        convertedDays.value['all'][i] = day;
    }
}

const isToday = (day: number | undefined) => {
    if (!day) return false;
    
    if(today.value == day){
        return true
    }
}

const getDay = (row: number, column: number) => (row-1) * 7 + column

onMounted(() => {
    calculateDays()
})

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
            <CalendarCell v-for="column in PER_ROW" 
                :day="convertedDays.all[getDay(row, column)]" 
                :weekday="column%7" 
                :overflow="typeof(convertedDays.bleed[getDay(row, column)]) == 'number'" 
                :active="isToday(convertedDays.normal[getDay(row, column)])"
                @click=""/>
        </div>
    </section>
</template>
<style scoped>
.cell {
    width: calc(100% / 7);
    min-height: 20%;
    cursor: pointer;
    user-select: none;
    -ms-user-select: none;
    -webkit-user-select: none;
    transition: background-color 0.125s ease-in;
}

.cell:hover:not(.overflow) {
    background-color: var(--accent-soft);
    border: 0.5px solid var(--accent-border) !important;
}
</style>