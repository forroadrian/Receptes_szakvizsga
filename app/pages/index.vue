<script setup>

</script>

<template>
    <section class="hero">
        <div class="container">
            <div class="row align-items-center g-4">
                <div class="col-12 col-lg-6">
                    <span class="badge text-bg-light border rounded-pill px-3 py-2 mb-3">✨ Tudatos étkezés,
                        könnyedén</span>
                    <h2>Tervezd meg az étrendedet!</h2>
                    <p class="text-secondary pb-4">
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

    <section>
        <div class="container ourFeatures" >
            <h2 class="text-center d-flex row">Miért válassz minket?</h2>
           <div class=" row flex flex-wrap text-center py-5">
                <div class="col-lg-4 col-md-6 col-sm-12 p-3">
                    <div>
                        <img src="../assets/icons/cooking.png" alt="">
                    </div>
                    <h3>Text title</h3>
                    <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Alias, doloribus.</p>
                </div>
                <div class="col-lg-4 col-md-6 col-sm-12 p-3">
                    <div>
                        <img src="../assets/icons/peking-duck.png" alt="">
                    </div>
                    <h3>Text title</h3>
                    <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Alias, doloribus.</p>
                </div>
                <div class="col-lg-4 col-md-6 col-sm-12 p-3">
                    <div>
                        <img src="../assets/icons/calendar.png" alt="">
                    </div>
                    <h3>Text title</h3>
                    <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Alias, doloribus.</p>
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
    min-height: 600px;
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

.ourFeatures h2:before,.ourFeatures h2:after {
    content: "";
    flex: 1 1;
    border-bottom: 2px solid var( --bs-emphasis-color);
    margin: auto 10px;
}

.ourFeatures img{
    background-size: contain;
    
}
</style>
