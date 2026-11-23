import { describe, expect, it, vi } from "vitest";
import { useRowDragAndDrop } from "@/composables/reorder/useRowDragAndDrop";

const dragEvent = () =>
  ({
    preventDefault: vi.fn(),
    dataTransfer: { setData: vi.fn(), effectAllowed: "" },
  }) as unknown as DragEvent;

const startDragging = async (index: number) => {
  const onDrop = vi.fn();
  const dragAndDrop = useRowDragAndDrop(onDrop);
  dragAndDrop.startDrag(dragEvent(), index);
  await new Promise((resolve) => setTimeout(resolve));
  return { dragAndDrop, onDrop };
};

describe("useRowDragAndDrop", () => {
  it("tracks the dragged and hovered rows", async () => {
    const { dragAndDrop } = await startDragging(2);
    const event = dragEvent();
    dragAndDrop.dragOver(event, 4);

    expect(dragAndDrop.isDragging.value).toBe(true);
    expect(dragAndDrop.overIndex.value).toBe(4);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("reports the drop and resets", async () => {
    const { dragAndDrop, onDrop } = await startDragging(2);
    dragAndDrop.dropAt(5);

    expect(onDrop).toHaveBeenCalledWith(2, 5);
    expect(dragAndDrop.isDragging.value).toBe(false);
  });

  it("ignores drag-over and drops when nothing is dragged", () => {
    const onDrop = vi.fn();
    const dragAndDrop = useRowDragAndDrop(onDrop);
    const event = dragEvent();
    dragAndDrop.dragOver(event, 1);
    dragAndDrop.dropAt(1);

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(onDrop).not.toHaveBeenCalled();
  });
});
