<template>
  <div class="save-toast" :class="{ show: showToast }">
    {{ toastMessage }}
  </div>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast';

const { toastMessage, showToast } = useToast();
</script>
