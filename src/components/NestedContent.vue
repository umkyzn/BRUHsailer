<template>
  <div v-if="nestedContent && nestedContent.length > 0" class="nested-content">
    <ul>
      <li v-for="(item, index) in nestedContent" :key="index">
        <FormattedContent :content="item.content" />
        <NestedContent v-if="item.nestedContent" :nestedContent="item.nestedContent" />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { Step } from '@/types/guide';
import FormattedContent from './FormattedContent.vue';

interface Props {
  nestedContent: Step[];
}

const props = defineProps<Props>();
</script>

