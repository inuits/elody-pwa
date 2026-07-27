import { ref } from "vue";

const isBlocking = ref<boolean>(false);
const blockingMessage = ref<string | undefined>(undefined);

export const useBlockingLoader = () => {
  const startBlocking = (message?: string): void => {
    blockingMessage.value = message;
    isBlocking.value = true;
  };

  const stopBlocking = (): void => {
    isBlocking.value = false;
    blockingMessage.value = undefined;
  };

  return { isBlocking, blockingMessage, startBlocking, stopBlocking };
};
