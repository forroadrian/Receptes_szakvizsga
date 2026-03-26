<script setup lang="ts">

</script>
<template>
<div id="statsCollapse" class="collapse d-md-block pb-4 border-bottom mt-4 mt-md-0 py-3">
    <div class="row row-gap-4 row-cols-lg-4 row-cols-md-2 justify-content-between text-center">
        <div class= "mb-md-0">
            <IngredientCardAmount :amount="0" image="/logo.webp" description="Összes" class="mx-auto"
                loading="lazy" />
        </div>
        <div class= "mb-md-0">
            <IngredientCardAmount :amount="0" image="/logo.webp" description="Friss" class="mx-auto"
                loading="lazy" />
        </div>
        <div class= "mb-md-0">
            <IngredientCardAmount :amount="0" image="/logo.webp" description="Hamarosan Lejár" class="mx-auto"
                loading="lazy" />
        </div>
        <div>
            <IngredientCardAmount :amount="0" image="/logo.webp" description="Lejárt" class="mx-auto"
                loading="lazy" />
        </div>
    </div>
</div>
</template>