<template>
    <div class="d-flex flex-column min-vh-100">
        <Header />
        <main class="container py-4 flex-grow-1">
            <slot />
        </main>
        <Footer />
    </div>
</template>
