<template>
    <div>
        <header class="border-bottom bg-white">
            <nav class="navbar navbar-expand-lg container py-2">
                <NuxtLink class="navbar-brand fw-semibold" to="/">MySite</NuxtLink>

                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div id="mainNav" class="collapse navbar-collapse">
                    <ul class="navbar-nav me-auto">
                        <li class="nav-item">
                            <NuxtLink class="nav-link" to="/">Home</NuxtLink>
                        </li>
                        <li class="nav-item">
                            <NuxtLink class="nav-link" to="/about">Rólunk</NuxtLink>
                        </li>
                    </ul>
                </div>
            </nav>
        </header>

        <main class="container py-4">
            <slot />
        </main>
    </div>
</template>
