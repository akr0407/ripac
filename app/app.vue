<template>
  <div :data-theme="theme">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const { theme } = useTheme();
</script>
