<template>
  <span
    v-for="(element, index) in content"
    :key="index"
    v-html="getFormattedHtml(element)"
  ></span>
</template>

<script setup lang="ts">
import type { ContentElement } from '@/types/guide';
import { useSearchHighlight } from '@/composables/useSearchHighlight';

interface Props {
  content: ContentElement[];
}

const props = defineProps<Props>();

function getFormattedHtml(element: ContentElement): string {
  const { highlightedText } = useSearchHighlight(element.text);
  const text = highlightedText.value;

  if (!element.formatting) {
    return text;
  }

  const styles: string[] = [];

  if (element.formatting.bold) {
    styles.push('font-weight: var(--font-semibold)');
  }

  if (element.formatting.italic) {
    styles.push('font-style: italic');
  }

  if (element.formatting.underline) {
    styles.push('text-decoration: underline');
  }

  if (element.formatting.color) {
    const { r, g, b } = element.formatting.color;
    // Convert normalized RGB values (0-1) to 0-255 range
    const r255 = Math.round(r * 255);
    const g255 = Math.round(g * 255);
    const b255 = Math.round(b * 255);

    // Skip black and white colors - let them use theme's default text color
    const isBlack = r255 === 0 && g255 === 0 && b255 === 0;
    const isWhite = r255 === 255 && g255 === 255 && b255 === 255;

    if (!isBlack && !isWhite) {
      styles.push(`color: rgb(${r255}, ${g255}, ${b255})`);
    }
  }

  if (styles.length === 0) {
    return text;
  }

  return `<span style="${styles.join('; ')}">${text}</span>`;
}

</script>
