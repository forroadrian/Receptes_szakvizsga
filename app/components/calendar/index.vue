<script setup lang="ts">
import { watch } from "vue";
import { HUNGARIAN_WEEKDAYS_SHORT, useCalendarGrid } from "~/composables/useCalendarGrid";
import { useMenuStore } from "~/stores/menu";
import { useMissingIngredients } from "~/composables/useMissingIngredients";

<<<<<<< Updated upstream
const month = ref(0)
const year = ref(0)
const today = ref(0)
=======
const emit = defineEmits<{
    (e: "empty-click", dateKey: string): void;
    (e: "menu-click", menuId: number): void;
    (e: "overflow-click", dateKey: string): void;
}>();
>>>>>>> Stashed changes

const menuStore = useMenuStore();
const missing = useMissingIngredients();
const user = useSupabaseUser();
const { year, month, cells, prevMonth, nextMonth, goToToday } = useCalendarGrid();

<<<<<<< Updated upstream
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
=======
const menusForCell = (dateKey: string) => menuStore.getMenusForDate(dateKey);

watch(
    [year, month, () => user.value?.id],
    () => {
        if (user.value) missing.loadCountsForMonth(year.value, month.value);
    },
    { immediate: true }
);

const goToDate = (dateKey: string) => {
    const [y, m] = dateKey.split("-").map(Number);
    if (y != null && m != null) {
        year.value = y;
        month.value = m - 1;
    }
};
>>>>>>> Stashed changes

defineExpose({ goToDate });
</script>

<template>
    <section class="calendar-wrapper">
        <CalendarMonthPicker
            :year="year"
            :month="month"
            @prev="prevMonth"
            @next="nextMonth"
            @today="goToToday"
        />

        <div class="weekday-row">
            <div v-for="day in HUNGARIAN_WEEKDAYS_SHORT" :key="day" class="weekday-label">
                {{ day }}
            </div>
        </div>
<<<<<<< Updated upstream
        <div class="d-flex justify-content-between" v-for="row in ROWS">
            <CalendarCell v-for="column in PER_ROW" 
                :day="convertedDays.all[getDay(row, column)]" 
                :weekday="column%7" 
                :overflow="typeof(convertedDays.bleed[getDay(row, column)]) == 'number'" 
                :active="isToday(convertedDays.normal[getDay(row, column)])"
                @click=""/>
=======

        <div class="grid">
            <CalendarCell
                v-for="cell in cells"
                :key="cell.dateKey"
                :cell="cell"
                :menus="menusForCell(cell.dateKey)"
                :missing-count="missing.getCount(cell.dateKey)"
                @empty-click="(k) => emit('empty-click', k)"
                @menu-click="(id) => emit('menu-click', id)"
                @overflow-click="(k) => emit('overflow-click', k)"
            />
>>>>>>> Stashed changes
        </div>
    </section>
</template>

<style scoped>
.calendar-wrapper {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.weekday-row,
.grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
}

.weekday-row {
    gap: 0;
    padding: 4px 0;
    border-bottom: 1px solid var(--bs-border-color);
}

.weekday-label {
    text-align: center;
    font-size: var(--small-text);
    font-weight: 600;
    color: var(--bs-secondary-color);
    text-transform: uppercase;
    letter-spacing: 0.03em;
}

.grid {
    gap: 0;
    border-left: 1px solid var(--bs-border-color);
    border-top: 1px solid var(--bs-border-color);
}

.grid > :deep(.cell) {
    border-left: 0;
    border-top: 0;
    border-right: 1px solid var(--bs-border-color);
    border-bottom: 1px solid var(--bs-border-color);
}

@media (max-width: 576px) {
    .weekday-label {
        font-size: 10px;
    }
}
</style>
