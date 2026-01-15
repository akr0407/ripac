<template>
  <div :data-theme="theme">
    <NuxtLayout>
      <NuxtPage />
      <ToastContainer />
      <ConfirmDialog />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const { theme } = useTheme();
</script>
