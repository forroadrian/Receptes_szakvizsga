<script setup lang="ts">
const months = [
    "Január",
    "Február",
    "Március",
    "Április",
    "Május",
    "Június",
    "Július",
    "Augusztus",
    "Szeptember",
    "Október",
    "November",
    "December"
];

const props = withDefaults(
    defineProps<{ is?: string }>(),
    { is: 'h3' }
);

const emit = defineEmits(['changed']);

const today: Date = new Date()
const currentMonth = ref(today.getMonth());
const currentYear = ref(today.getFullYear());

const increment = (amt: number) => {
    currentMonth.value += amt;
    if (currentMonth.value > 11) {
        currentMonth.value = 0;
        currentYear.value++;
    }
    emit('changed',currentMonth.value, currentYear.value);
}

const decrement = (amt: number) => {
    currentMonth.value -= amt;
    if (currentMonth.value < 0) {
        currentMonth.value = 11;
        currentYear.value--;
    }
    emit('changed',currentMonth.value, currentYear.value);
}

onMounted(() => {
    emit('changed',currentMonth.value, currentYear.value)
})

</script>
<template>
    <component class="text-center d-flex justify-content-center" :is="is">
        <i class="bi bi-arrow-left me-3" @click="decrement(1)"></i>
        <span class="month text-truncate">{{currentYear}}. {{ months[currentMonth] }}</span>
        <i class="bi bi-arrow-right ms-3" @click="increment(1)"></i>
    </component>
</template>
<style scoped>
.month {
    width: 16rem;
}
</style>