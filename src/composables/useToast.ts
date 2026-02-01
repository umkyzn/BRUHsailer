import { ref } from 'vue';

const toastMessage = ref('');
const showToast = ref(false);

export function useToast() {
  function showToastMessage(message: string, duration = 2000) {
    toastMessage.value = message;
    showToast.value = true;
    setTimeout(() => {
      showToast.value = false;
    }, duration);
  }

  return {
    toastMessage,
    showToast,
    showToastMessage
  };
}
