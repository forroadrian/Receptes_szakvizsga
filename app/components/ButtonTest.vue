<script setup></script>

<template>
    <div class="controls d-flex  flex-column gap-3 p-3">
        <div class="d-flex gap-3 flex-wrap">
            <Button color="orange" icon="bi bi-arrow-right-circle">Orange</Button>
            <Button color="yellow">Yellow</Button>
            <Button color="yellow" disabled>Yellow disabled</Button>
            <Button color="dark">Lorem ipsum </Button>
            <Button color="green" icon="bi bi-arrow-right-circle" icon-only></Button>
            <Button color="green" icon="bi bi-arrow-right-circle" icon-position="right"> Green </Button>
            <Button color="green" outline>Lorem ipsum </Button>
            <Button color="yellow" outline>Lorem ipsum </Button>
            <Button color="orange" outline>Lorem ipsum </Button>
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