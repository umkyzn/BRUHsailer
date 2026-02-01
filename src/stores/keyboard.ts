import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useKeyboardStore = defineStore('keyboard', () => {
  const commandPaletteOpen = ref(false);
  const shortcutsHelpOpen = ref(false);

  function toggleCommandPalette() {
    commandPaletteOpen.value = !commandPaletteOpen.value;
  }

  function openCommandPalette() {
    commandPaletteOpen.value = true;
  }

  function closeCommandPalette() {
    commandPaletteOpen.value = false;
  }

  function toggleShortcutsHelp() {
    shortcutsHelpOpen.value = !shortcutsHelpOpen.value;
  }

  function openShortcutsHelp() {
    shortcutsHelpOpen.value = true;
  }

  function closeShortcutsHelp() {
    shortcutsHelpOpen.value = false;
  }

  return {
    commandPaletteOpen,
    shortcutsHelpOpen,
    toggleCommandPalette,
    openCommandPalette,
    closeCommandPalette,
    toggleShortcutsHelp,
    openShortcutsHelp,
    closeShortcutsHelp,
  };
});
