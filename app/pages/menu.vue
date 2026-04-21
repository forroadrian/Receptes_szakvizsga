<script setup>
const today = new Date(Date.now())
const numberToDay = [
    "Vasárnap",
    "Hétfő",
    "Kedd",
    "Szerda",
    "Csütörtök",
    "Péntek",
    "Szombat"
]


</script>
<template>
    <section class="row mb-4">
        <div>
            <h1>Menütervező</h1>
            <p class="description">Tervezd meg az étkezéseidet néhány kattintással — ebéd, vacsora, desszert. A naptárból válaszd ki a napot, és adj hozzá menüt.</p>
        </div>
    </section>
    <section class="row mb-4">
        <div class="col-lg-4 col-12 border rounded-3 text-center mt-3 statistics">
            <p class="fs-1 fw-bold mb-0">{{ today.getDate() }}</p>
            <p class="fs-2 fw-semibold">{{ numberToDay[today.getDay()] }}</p>
        </div>
        <div class="col-lg-8 col-12 ps-5">
            <Calendar @changed="" v-model:today-as-number="todayAsNumber" v-model:today-as-day="todayAsDay"></Calendar>
        </div>
    </section>


</template>

<style scoped>
.description {
    width: 40%
}

.statistics {
    border-top: none !important;
    -webkit-box-shadow: 1px 10px 22px 4px rgba(179,179,179,0.76); 
    box-shadow: 1px 10px 22px 1px rgba(179,179,179,0.76);
}
</style>