<template>
  <UApp :toaster="(toaster as any)">
    <NuxtLayout :key="route.fullPath">
      <NuxtPage :page-key="(route) => route.fullPath" />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
const route = useRoute()
const toaster = { position: 'top-right', duration: 2000 }
</script>
