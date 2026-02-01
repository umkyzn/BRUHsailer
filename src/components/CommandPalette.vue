<template>
  <Teleport to="body">
    <div v-if="keyboardStore.commandPaletteOpen" class="command-palette-overlay" @click="close">
      <div class="command-palette" @click.stop>
        <div class="command-palette-header">
          <input
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            placeholder="Type a command or search..."
            class="command-palette-input"
            @keydown.down.prevent="navigateDown"
            @keydown.up.prevent="navigateUp"
            @keydown.enter.prevent="executeCommand"
            @keydown.esc="close"
          />
        </div>
        <div class="command-palette-results">
          <div
            v-for="(command, index) in filteredCommands"
            :key="command.id"
            :class="['command-item', { active: index === selectedIndex }]"
            @click="executeCommand(command)"
            @mouseenter="selectedIndex = index"
          >
            <div class="command-icon">{{ command.icon }}</div>
            <div class="command-content">
              <div class="command-title">{{ command.title }}</div>
              <div v-if="command.description" class="command-description">
                {{ command.description }}
              </div>
            </div>
            <div v-if="command.shortcut" class="command-shortcut">
              {{ command.shortcut }}
            </div>
          </div>
          <div v-if="filteredCommands.length === 0" class="no-results">
            No commands found
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useKeyboardStore } from '@/stores/keyboard';
import { useGuideStore } from '@/stores/guide';
import { useFilterStore } from '@/stores/filter';
import { useUiStore } from '@/stores/ui';

interface Command {
  id: string;
  title: string;
  description?: string;
  icon: string;
  shortcut?: string;
  action: () => void;
  keywords?: string[];
}

const keyboardStore = useKeyboardStore();
const router = useRouter();
const guideStore = useGuideStore();
const filterStore = useFilterStore();
const uiStore = useUiStore();

const searchInput = ref<HTMLInputElement>();
const searchQuery = ref('');
const selectedIndex = ref(0);

const commands = computed<Command[]>(() => {
  const cmds: Command[] = [
    {
      id: 'search',
      title: 'Search steps',
      description: 'Search through all guide steps',
      icon: '🔍',
      shortcut: '/',
      action: () => {
        close();
        document.getElementById('searchInput')?.focus();
      },
      keywords: ['find', 'search', 'filter'],
    },
    {
      id: 'toggle-dark-mode',
      title: 'Toggle dark mode',
      description: 'Switch between light and dark themes',
      icon: '🌙',
      action: () => {
        uiStore.toggleDarkMode();
        close();
      },
      keywords: ['theme', 'dark', 'light'],
    },
    {
      id: 'show-all',
      title: 'Show all steps',
      description: 'Display all steps regardless of completion',
      icon: '📋',
      action: () => {
        filterStore.setFilter('all');
        close();
      },
      keywords: ['filter', 'all', 'show'],
    },
    {
      id: 'show-incomplete',
      title: 'Show incomplete steps',
      description: 'Display only incomplete steps',
      icon: '⭕',
      action: () => {
        filterStore.setFilter('incomplete');
        close();
      },
      keywords: ['filter', 'incomplete', 'todo', 'pending'],
    },
    {
      id: 'show-completed',
      title: 'Show completed steps',
      description: 'Display only completed steps',
      icon: '✅',
      action: () => {
        filterStore.setFilter('completed');
        close();
      },
      keywords: ['filter', 'completed', 'done', 'finished'],
    },
    {
      id: 'minimize-completed',
      title: 'Minimize completed steps',
      description: 'Collapse completed step content',
      icon: '📦',
      action: () => {
        filterStore.toggleMinimizeCompleted();
        close();
      },
      keywords: ['minimize', 'collapse', 'hide', 'completed'],
    },
  ];

  // Add chapter navigation commands
  if (guideStore.guideData) {
    guideStore.guideData.chapters.forEach((chapter: any, index: number) => {
      cmds.push({
        id: `chapter-${index}`,
        title: `Go to ${chapter.title}`,
        description: `Jump to chapter ${index + 1}`,
        icon: '📖',
        action: () => {
          router.push(`/c/${index}`);
          uiStore.expandedChapters.value.add(index);
          close();
        },
        keywords: ['chapter', 'jump', 'navigate', chapter.title?.toLowerCase() || ''],
      });
    });
  }

  return cmds;
});

const filteredCommands = computed(() => {
  if (!searchQuery.value.trim()) {
    return commands.value;
  }

  const query = searchQuery.value.toLowerCase();
  return commands.value.filter((cmd) => {
    const titleMatch = cmd.title.toLowerCase().includes(query);
    const descMatch = cmd.description?.toLowerCase().includes(query);
    const keywordMatch = cmd.keywords?.some((k) => k.includes(query));
    return titleMatch || descMatch || keywordMatch;
  });
});

function navigateDown() {
  selectedIndex.value = Math.min(
    selectedIndex.value + 1,
    filteredCommands.value.length - 1
  );
}

function navigateUp() {
  selectedIndex.value = Math.max(selectedIndex.value - 1, 0);
}

function executeCommand(command?: Command) {
  const cmd = command || filteredCommands.value[selectedIndex.value];
  if (cmd) {
    cmd.action();
  }
}

function close() {
  keyboardStore.closeCommandPalette();
  searchQuery.value = '';
  selectedIndex.value = 0;
}

// Auto-focus input when palette opens
watch(
  () => keyboardStore.commandPaletteOpen,
  (isOpen) => {
    if (isOpen) {
      nextTick(() => {
        searchInput.value?.focus();
      });
    }
  }
);
</script>

