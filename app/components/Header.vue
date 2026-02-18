<script setup></script>
<template>
    <header>
        <nav class="navbar navbar-expand-lg container py-2">
            <div>
                <NuxtLink class="navbar-brand" to="/"><img src="../assets/images/logo.png" alt="Brand logo"
                        title="Brand logo"></NuxtLink>
            </div>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav"
                aria-controls="mainNav" aria-expanded="false" aria-label="Menü">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div id="mainNav" class="collapse navbar-collapse text-center text-lg-start">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item ">
                        <NuxtLink class="nav-link " to="/"><i class="bi bi-house"></i> Kezdőlap</NuxtLink>
                    </li>
                    <li class="nav-item">
                        <NuxtLink class="nav-link" to="/recipes"><i class="bi bi-fork-knife"></i>Receptek</NuxtLink>
                    </li>
                    <li class="nav-item">
                        <NuxtLink class="nav-link" to="/ingredients"><i class="bi bi-box-seam"></i>Alapanyagok
                        </NuxtLink>
                    </li>
                    <li class="nav-item">
                        <NuxtLink class="nav-link" to="/menuPlanner"><i class="bi bi-calendar-date"></i>Menütervező
                        </NuxtLink>
                    </li>
                </ul>
                <div class="d-flex flex-column flex-lg-row gap-2 mt-3 mt-lg-0 ">
                    <NuxtLink class="grad orange" to="/login">Belépés</NuxtLink>
                    <NuxtLink class="grad orange outline" to="/signup">Regisztráció
                    </NuxtLink>
                </div>
            </div>
        </nav>
    </header>


</template>

<style scoped>
.nav-link,
.btn {
    font-size: var(--nav-font-size);
}

.btn {
    padding: 10px 20px;
}

.nav-link {
    text-align: center;
}

.nav-link i {
    font-size: var(--nav-icon-size);
    margin-right: 10px;
}

.navbar-brand img {
    width: var(--brand-logo-width);
}

.navbar-toggler,
.navbar-brand img,
.nav-link {
    margin: 0px 20px;
}


@media (max-width: 991px) {

    .nav-link,
    .btn {
        font-size: var(--nav-font-size-lg);
    }

    .btn {
        margin: 0px 20px;
    }
}
</style>