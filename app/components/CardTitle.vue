<script setup lang="ts">
export type HeadingRank = 1 | 2 | 3 | 4 | 5 | 6

const props = withDefaults(
  defineProps<{ rank?: HeadingRank }>(),
  { rank: 2 }
)

const headingTag = computed<`h${HeadingRank}`>(() => `h${props.rank}` as const)
</script>
<template>
  <component :is="headingTag" class="card--title text-center">
    <slot></slot>
  </component>
</template>

<style scoped>



</style>