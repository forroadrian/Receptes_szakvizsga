<script setup>

</script>

<template>
    <section class="hero">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-12 col-lg-6 my-5">
                    <span class="badge soft border rounded-pill px-3 py-2 mb-3">✨ Tudatos étkezés,
                        könnyedén</span>
                    <h2>Tervezd meg az étrendedet!</h2>
                    <p class="py-4">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                        labore et dolore magna aliqua.
                    </p>
                    <div class="d-flex flex-wrap gap-2">
                        <Button to="/recipes" color="yellow" icon="bi bi-arrow-right-circle"
                            iconPosition="right">Receptek megtekintése</Button>
                        <Button to="/login" color="orange outline" iconPosition="right">Alapanyagaim</Button>
                    </div>

                </div>
                <div class="col-lg-6 hero-image d-flex"></div>
            </div>
        </div>
    </section>

    <section class="ourFeatures">
        <div class="container">
            <h2 class="text-center d-flex row">Miért válassz minket?</h2>
            <div class=" row flex flex-wrap text-center py-4">
                <div class="col-lg-4 col-md-6 col-sm-12 p-4">
                    <div>
                        <img src="../assets/icons/cooking.png" alt="">
                    </div>
                    <h3>Könnyű receptek </h3>
                    <p>Lorem ipsum dolor sit amet consectetur,<br> adipisicing elit. Alias, doloribus.</p>
                </div>
                <div class="col-lg-4 col-md-6 col-sm-12 p-3">
                    <div>
                        <img src="../assets/icons/clock.png" alt="">
                    </div>
                    <h3>Idő spórolás</h3>
                    <p>Lorem ipsum dolor sit amet consectetur,<br> adipisicing elit. Alias, doloribus.</p>
                </div>
                <div class="col-lg-4 col-md-6 col-sm-12 p-3">
                    <div>
                        <img src="../assets/icons/calendar.png" alt="">
                    </div>
                    <h3>Menütervezés </h3>
                    <p>Lorem ipsum dolor sit amet consectetur,<br>adipisicing elit. Alias, doloribus.</p>
                </div>
                <div class="col-lg-4 col-md-6 col-sm-12 p-3">
                    <div>
                        <img src="../assets/icons/ingredient.png" alt="">
                    </div>
                    <h3>Alapanyagok kezelése</h3>
                    <p>Lorem ipsum dolor sit amet consectetur,<br> adipisicing elit. Alias, doloribus.</p>
                </div>
                <div class="col-lg-4 col-md-6 col-sm-12 p-3">
                    <div>
                        <img src="../assets/icons/peking-duck.png" alt="">
                    </div>
                    <h3>Változatos étkezések</h3>
                    <p>Lorem ipsum dolor sit amet consectetur,<br> adipisicing elit. Alias, doloribus.</p>
                </div>
                <div class="col-lg-4 col-md-6 col-sm-12 p-3">
                    <div>
                        <img src="../assets/icons/man.png" alt="">
                    </div>
                    <h3>Személyre szabhatóság</h3>
                    <p>Lorem ipsum dolor sit amet consectetur,<br>adipisicing elit. Alias, doloribus.</p>
                </div>
            </div>
        </div>
    </section>

</template>

<style scoped>
h2 {
    font-weight: 700;
    font-size: 42px;
}

.hero-image {
    min-height: 500px;
    width: 570px;
    background-image: url('../assets/images/proba.png');
    background-size: 80%;
    background-repeat: no-repeat;
    background-position: 60% 40%;
    filter:
        drop-shadow(0 20px 30px rgba(255, 255, 255, 0.137)) drop-shadow(0 20px 50px rgba(255, 120, 0, 0.4)) drop-shadow(0 0 80px rgba(255, 150, 50, 0.35));
}

.hero::before {
    content: "";
    position: absolute;
    top: 30%;
    bottom: 20%;
    left: 0;
    right: 0;
    background: linear-gradient(to bottom, transparent 20%, rgba(255, 138, 70, 0.3) 35%, rgba(250, 97, 8, 0.356) 15%, transparent 60%);
    filter: blur(100px);
    pointer-events: none;
}

.ourFeatures h2:before,
.ourFeatures h2:after {
    content: "";
    flex: 1 1;
    border-bottom: 2px solid var(--bs-emphasis-color);
    margin: auto 10px;

}

.ourFeatures {
    margin: 70px 0px;
}


.ourFeatures img {
    margin-bottom: 10px;
}


@media (min-width: 992px) {}

@media (max-width: 992px) {

    .hero-image {
        max-width: 600px;
        margin: 0px auto;
    }

    .ourFeatures {
        margin-top: 150px;
    }
}
</style>
