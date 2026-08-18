import { describe, it, expect, vi, beforeEach } from "vitest";
import { useBaseNotification } from "../useBaseNotification";

const mockNotify = vi.hoisted(() => {
  const fn = vi.fn() as any;
  fn.close = vi.fn();
  return fn;
});

vi.mock("@kyvg/vue3-notification", () => ({
  useNotification: () => ({ notify: mockNotify }),
}));

vi.mock("@/helpers", () => ({
  getTranslatedMessage: (key: string) => key,
}));

describe("useBaseNotification - persistent notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("displayPersistentNotification shows a notification with the given id and no auto-dismiss", () => {
    const { displayPersistentNotification } = useBaseNotification();

    displayPersistentNotification(42, "title.key", "text.key", "warn");

    expect(mockNotify).toHaveBeenCalledWith({
      id: 42,
      title: "title.key",
      text: "text.key",
      type: "warn",
      duration: -1,
    });
  });

  it("closeNotification closes the notification with the given id", () => {
    const { closeNotification } = useBaseNotification();

    closeNotification(42);

    expect(mockNotify.close).toHaveBeenCalledWith(42);
  });
});
