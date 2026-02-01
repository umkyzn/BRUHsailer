import { onMounted, onUnmounted } from 'vue';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  handler: () => void;
  preventDefault?: boolean;
}

export function useKeyboard() {
  const shortcuts = new Map<string, KeyboardShortcut>();

  function getShortcutKey(event: KeyboardEvent): string {
    const parts: string[] = [];
    if (event.ctrlKey) parts.push('ctrl');
    if (event.metaKey) parts.push('meta');
    if (event.shiftKey) parts.push('shift');
    if (event.altKey) parts.push('alt');
    parts.push(event.key.toLowerCase());
    return parts.join('+');
  }

  function handleKeyDown(event: KeyboardEvent) {
    const shortcutKey = getShortcutKey(event);
    const shortcut = shortcuts.get(shortcutKey);

    if (shortcut) {
      if (shortcut.preventDefault !== false) {
        event.preventDefault();
      }
      shortcut.handler();
    }
  }

  function register(shortcut: KeyboardShortcut) {
    const parts: string[] = [];
    if (shortcut.ctrl) parts.push('ctrl');
    if (shortcut.meta) parts.push('meta');
    if (shortcut.shift) parts.push('shift');
    if (shortcut.alt) parts.push('alt');
    parts.push(shortcut.key.toLowerCase());
    const key = parts.join('+');

    shortcuts.set(key, shortcut);
  }

  function unregister(key: string) {
    shortcuts.delete(key);
  }

  function registerShortcuts(shortcutList: KeyboardShortcut[]) {
    shortcutList.forEach(register);
  }

  function getShortcuts(): KeyboardShortcut[] {
    return Array.from(shortcuts.values());
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
  });

  return {
    register,
    unregister,
    registerShortcuts,
    getShortcuts,
  };
}
