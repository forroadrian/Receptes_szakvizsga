<script setup></script>

<template>
    <div class="buttons d-flex flex-column">
        <button class="rbtn rbtn--orange m-3">Orange</button>
        <button class="rbtn rbtn--green m-3">Green</button>
        <button class="rbtn rbtn--light m-3">Light</button>

        <button class="rbtn rbtn--orange rbtn--outline m-3">Orange</button>
        <button class="rbtn rbtn--green rbtn--outline m-3">Green</button>
        <button class="rbtn rbtn--light rbtn--outline m-3">light</button>

        <h4 class="rtext rtext--green">Kategóriáink </h4>
        <h1 class="rtext rtext--orange">Főcím és egyéb fontos szöveg</h1>
        <h3 class="rtext rtext--green"> Alcím </h3>
        <p>Leírások Lorem ipsum dolor sit, amet consectetur adipisicing elit. Minima, necessitatibus.</p>
        <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Minima,
            necessitatibus.</p>
    </div>
</template>

<style scoped>
h1 {
    font-family: "Caveat Brush", cursive;
    text-transform: uppercase;
}

p {
    font-family: "Montserrat", sans-serif;
    font-weight: 600;

}

span {
    font-family: "Inter", sans-serif;
}

h3 {
    font-family: "Poppins", sans-serif;
    text-transform: uppercase;
    letter-spacing: 2px;

}

h4 {
    font-family: "Caveat", cursive;
    font-weight: 600;
    font-size: 30px;
}

.rbtn {
    width: 40%;
    font-size: 22px;

}
</style>