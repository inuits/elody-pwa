# Composable Testing

## Simple composables — no lifecycle hooks

Call the composable directly. No component wrapper needed.

```typescript
import { useEntityDiff } from "@/composables/useEntityDiff";

describe("useEntityDiff", () => {
  it("returns empty diff for identical objects", () => {
    const { getDiff } = useEntityDiff();
    expect(getDiff({ name: "Alice" }, { name: "Alice" })).toEqual([]);
  });

  it("detects a changed field", () => {
    const { getDiff } = useEntityDiff();
    const result = getDiff({ name: "Alice" }, { name: "Bob" });
    expect(result).toContainEqual({ field: "name", from: "Alice", to: "Bob" });
  });
});
```

## Reactive state — call action, then check .value

```typescript
import { useBaseModal } from "@/composables/useBaseModal";

describe("useBaseModal", () => {
  beforeEach(() => {
    const { closeAllModals } = useBaseModal();
    closeAllModals(); // reset singleton state
    vi.clearAllMocks();
  });

  it("opens a modal", () => {
    const { modalInfo, openModal } = useBaseModal();
    openModal(TypeModals.DynamicForm, ModalStyle.Center);
    expect(modalInfo.open).toBe(true);
    expect(modalInfo.type).toBe(TypeModals.DynamicForm);
  });

  it("closes an open modal", () => {
    const { modalInfo, openModal, closeModal } = useBaseModal();
    openModal(TypeModals.DynamicForm, ModalStyle.Center);
    closeModal();
    expect(modalInfo.open).toBe(false);
  });
});
```

## Composables with lifecycle hooks — withSetup helper

If the composable uses `onMounted`, `onUnmounted`, `provide`, or `inject`, it must run
inside a Vue component context:

```typescript
import { mount } from "@vue/test-utils";
import { defineComponent } from "vue";

function withSetup<T>(composable: () => T): [T, ReturnType<typeof mount>] {
  let result!: T;
  const TestComponent = defineComponent({
    setup() {
      result = composable();
      return {};
    },
    template: "<div />",
  });
  const wrapper = mount(TestComponent);
  return [result, wrapper];
}

it("cleans up event listener on unmount", () => {
  const addSpy = vi.spyOn(window, "addEventListener");
  const removeSpy = vi.spyOn(window, "removeEventListener");

  const [, wrapper] = withSetup(() => useMyComposable());
  expect(addSpy).toHaveBeenCalledWith("resize", expect.any(Function));

  wrapper.unmount();
  expect(removeSpy).toHaveBeenCalledWith("resize", expect.any(Function));
});
```

## Async composables

```typescript
it("fetches permissions and caches the result", async () => {
  const mockFetch = vi.fn().mockResolvedValue({ canEdit: true });
  vi.mock("@/api/permissions", () => ({ fetchPermissions: mockFetch }));

  const { getPermission } = usePermissions();
  const first = await getPermission("edit");
  const second = await getPermission("edit"); // should use cache

  expect(mockFetch).toHaveBeenCalledOnce();
  expect(first).toBe(true);
  expect(second).toBe(true);
});

it("re-throws API errors", async () => {
  vi.mock("@/api/permissions", () => ({
    fetchPermissions: vi.fn().mockRejectedValueOnce(new Error("API Error")),
  }));

  const { getPermission } = usePermissions();
  await expect(getPermission("edit")).rejects.toThrow("API Error");
});
```

## Composables with singleton state

If the composable holds module-level state, use a project-provided reset helper or
`vi.resetModules()` between tests (expensive — prefer having a `reset` export):

```typescript
import { usePermissions, resetAdvancedPermissions, setIgnorePermissions } from "@/composables/usePermissions";

beforeEach(() => {
  vi.clearAllMocks();
  resetAdvancedPermissions();
  setIgnorePermissions(false);
});
```
