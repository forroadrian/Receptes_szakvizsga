<script lang="ts" setup>
</script>
<template>
  <Button
    class="col-lg-4 col-10 mx-auto"
    icon="bi bi-plus"
    type="button"
    @click="$emit('openIngredientModal')"
    >Új hozzávaló hozzáadása</Button
  >
  <Button
    class="d-md-none col-1 border-2"
    outline
    color="dark"
    icon="bi bi-graph-up"
    iconPosition="left"
    icon-only
    type="button"
    data-bs-toggle="collapse"
    data-bs-target="#statsCollapse"
  >
  </Button>
</template>
