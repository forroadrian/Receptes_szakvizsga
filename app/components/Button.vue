<script setup></script>

<template>
    <div class="controls d-flex  flex-column gap-3 p-3">

        <div class="d-flex gap-3 flex-wrap">
            <button class="grad orange">Orange</button>
            <button class="grad green">Green</button>
            <button class="grad yellow">Yellow</button>
            <button class="grad soft">Neutral Light</button>
            <button class="grad dark">Neutral Dark</button>

        </div>

        <div class="d-flex gap-3 flex-wrap">
            <button class="grad orange outline">Orange</button>
            <button class="grad green outline">Green</button>
            <button class="grad yellow outline">Yellow</button>
            <button class="grad dark outline">Dark</button>
        </div>

        <div class="d-flex gap-3">
            <button type="button" class="grad orange" disabled>Disabled</button>
            <button type="button" class="grad dark outline" disabled>Disabled</button>
        </div>

        <div class="text d-flex flex-column gap-2">
            <h4 class="grad-text text-yellow m-0">Kategóriáink</h4>
            <h1 class="grad-text text-orange m-0">Főcím és egyéb fontos szöveg</h1>
            <h3 class="grad-text text-green">Alcím</h3>

            <p>Leírások Lorem ipsum dolor sit, amet consectetur adipisicing elit. Minima, necessitatibus.</p>
            <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Minima, necessitatibus.</p>
        </div>

    </div>
</template>

<style scoped></style>