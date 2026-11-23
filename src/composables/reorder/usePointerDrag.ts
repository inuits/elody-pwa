import { ref, type Ref } from "vue";

const AUTOSCROLL_EDGE_SIZE = 50;
const AUTOSCROLL_STEP = 14;

export const usePointerDrag = (
  scroller: Ref<HTMLElement | undefined>,
  onDrop: (from: number, to: number) => void,
) => {
  const pointerDrag = ref<{ index: number; over: number; offsetY: number }>();
  let pointerStart = { y: 0, scrollTop: 0 };

  const autoScrollNearEdges = (
    scrollContainer: HTMLElement,
    pointerY: number,
  ) => {
    const bounds = scrollContainer.getBoundingClientRect();
    if (pointerY < bounds.top + AUTOSCROLL_EDGE_SIZE)
      scrollContainer.scrollTop -= AUTOSCROLL_STEP;
    else if (pointerY > bounds.bottom - AUTOSCROLL_EDGE_SIZE)
      scrollContainer.scrollTop += AUTOSCROLL_STEP;
  };

  const rowIndexUnderPointer = (
    event: PointerEvent,
    draggedIndex: number,
  ): number | undefined => {
    const elements = document.elementsFromPoint(event.clientX, event.clientY);
    for (const element of elements) {
      const row = element.closest<HTMLElement>("[data-reorder-index]");
      if (!row) continue;
      const rowIndex = Number(row.dataset.reorderIndex);
      if (rowIndex !== draggedIndex) return rowIndex;
    }
    return undefined;
  };

  const startPointerDrag = (event: PointerEvent, index: number) => {
    event.preventDefault();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    pointerStart = { y: event.clientY, scrollTop: scroller.value!.scrollTop };
    pointerDrag.value = { index, over: index, offsetY: 0 };
  };

  const movePointerDrag = (event: PointerEvent) => {
    const drag = pointerDrag.value;
    const scrollContainer = scroller.value;
    if (!drag || !scrollContainer) return;

    autoScrollNearEdges(scrollContainer, event.clientY);
    const scrolledDistance = scrollContainer.scrollTop - pointerStart.scrollTop;
    const movedDistance = event.clientY - pointerStart.y;
    pointerDrag.value = {
      index: drag.index,
      over: rowIndexUnderPointer(event, drag.index) ?? drag.over,
      offsetY: movedDistance + scrolledDistance,
    };
  };

  const endPointerDrag = () => {
    const drag = pointerDrag.value;
    pointerDrag.value = undefined;
    if (drag) onDrop(drag.index, drag.over);
  };

  return { pointerDrag, startPointerDrag, movePointerDrag, endPointerDrag };
};
