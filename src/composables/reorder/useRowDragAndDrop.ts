import { computed, ref } from "vue";

export const useRowDragAndDrop = (
  onDrop: (from: number, to: number) => void,
) => {
  const dragIndex = ref<number>();
  const overIndex = ref<number>();
  const isDragging = computed(() => dragIndex.value !== undefined);

  const startDrag = (event: DragEvent, index: number) => {
    event.dataTransfer!.effectAllowed = "move";
    // Firefox only starts a drag when data is set
    event.dataTransfer!.setData("text/plain", String(index));
    // Dim the row a tick later, after the browser took the drag image
    setTimeout(() => (dragIndex.value = index));
  };

  const allowDrop = (event: DragEvent) => {
    if (isDragging.value) event.preventDefault();
  };

  const dragOver = (event: DragEvent, index: number) => {
    if (!isDragging.value) return;
    event.preventDefault();
    overIndex.value = index;
  };

  const endDrag = () => {
    dragIndex.value = undefined;
    overIndex.value = undefined;
  };

  const dropAt = (target: number) => {
    if (dragIndex.value !== undefined) onDrop(dragIndex.value, target);
    endDrag();
  };

  return {
    dragIndex,
    overIndex,
    isDragging,
    startDrag,
    allowDrop,
    dragOver,
    dropAt,
    endDrag,
  };
};
