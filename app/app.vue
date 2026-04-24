<script setup lang="ts">
const { locale, t } = useI18n()

useHead({
  htmlAttrs: { lang: locale },
  titleTemplate: (title?: string) => {
    const siteName = t('common.siteName')
    return title ? `${title} · ${siteName}` : siteName
  },
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
    <Alert />
  </NuxtLayout>
</template>