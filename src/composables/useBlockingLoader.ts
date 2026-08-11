import { ref } from "vue";

const isBlocking = ref<boolean>(false);
const blockingMessage = ref<string | undefined>(undefined);
// Refcounted: several modals can be open at once, so the first stopBlocking()
// must not clear the overlay while another operation is still running.
const runningOperations = ref<number>(0);

export const useBlockingLoader = () => {
  const startBlocking = (message?: string): void => {
    runningOperations.value += 1;
    // the outermost operation owns the message: a nested start must not
    // overwrite it, and a message-less outermost start must not inherit one
    if (runningOperations.value === 1) blockingMessage.value = message;
    isBlocking.value = true;
  };

  const stopBlocking = (): void => {
    runningOperations.value = Math.max(0, runningOperations.value - 1);
    if (runningOperations.value > 0) return;
    isBlocking.value = false;
    blockingMessage.value = undefined;
  };

  return { isBlocking, blockingMessage, startBlocking, stopBlocking };
};
