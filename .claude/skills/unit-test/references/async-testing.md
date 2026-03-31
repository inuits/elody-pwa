# Async Testing

## Which helper to use

- **`await flushPromises()`** — drains all pending Promises and microtasks. Use after API calls, Apollo queries, or any async side effect.
- **`await nextTick()`** or **`await wrapper.vm.$nextTick()`** — flushes Vue's reactive render queue. Use after mutating reactive state directly.
- `flushPromises` is the stronger of the two; it implies `nextTick`.

```typescript
import { nextTick } from "vue";
import { flushPromises } from "@vue/test-utils";
```

## Async API calls

```typescript
it("displays results after fetch", async () => {
  mockFetch.mockResolvedValue([{ id: "1", title: "Result A" }]);

  const wrapper = mount(SearchComponent);
  await wrapper.find('input[type="search"]').setValue("query");
  await wrapper.find("form").trigger("submit");
  await flushPromises();

  expect(wrapper.findAll('[data-cy="result-item"]')).toHaveLength(1);
  expect(wrapper.text()).toContain("Result A");
});
```

## DOM interaction sequences

Await each step in sequence:

```typescript
it("submits correct value on Enter", async () => {
  const wrapper = mount(DatePickerComponent);

  const input = wrapper.find("input.dp__input");
  await input.setValue("15/01/2026 11:11");
  await input.trigger("keydown", { key: "Enter", code: "Enter" });
  await flushPromises();
  await wrapper.vm.$nextTick();

  const emitted = wrapper.emitted("update:modelValue");
  expect(emitted).toBeTruthy();
  expect(emitted![emitted!.length - 1][0]).toBe("2026-01-15T11:11:00+00:00");
});
```

## Testing in-flight async state

Use a deferred Promise to assert state while the async operation is still pending:

```typescript
it("shows loading state while fetching", async () => {
  let resolve!: (v: unknown) => void;
  mockFetch.mockReturnValue(new Promise((r) => (resolve = r)));

  const wrapper = mount(MyComponent);
  // still pending — check loading state
  expect(wrapper.find('[data-cy="loading-spinner"]').exists()).toBe(true);

  // now resolve and check final state
  resolve({ data: [] });
  await flushPromises();
  expect(wrapper.find('[data-cy="loading-spinner"]').exists()).toBe(false);
});
```

## Async error paths

```typescript
it("shows error notification when save fails", async () => {
  mockSave.mockRejectedValueOnce(new Error("Server error"));

  const wrapper = mount(EntityForm);
  await wrapper.find('[data-cy="save-button"]').trigger("click");
  await flushPromises();

  expect(wrapper.find('[data-cy="error-toast"]').exists()).toBe(true);
});
```

## Async composable errors

```typescript
it("propagates API errors to the caller", async () => {
  mockApiFetch.mockRejectedValueOnce(new Error("API Error"));

  const { fetchData } = useDataComposable();
  await expect(fetchData("entity-id")).rejects.toThrow("API Error");
});
```

## Fake timers (setTimeout / setInterval)

```typescript
it("shows timeout error after 5 seconds", async () => {
  vi.useFakeTimers();

  const wrapper = mount(AsyncOperation);
  await wrapper.find("button").trigger("click");
  vi.advanceTimersByTime(5000);
  await flushPromises();

  expect(wrapper.find('[data-cy="timeout-error"]').exists()).toBe(true);

  vi.useRealTimers();
});
```

## nextTick for reactive updates

```typescript
it("updates after prop change", async () => {
  const wrapper = mount(Counter);
  await wrapper.setProps({ count: 5 }); // setProps already awaits nextTick
  expect(wrapper.find('[data-cy="count"]').text()).toBe("5");
});

// When you mutate a ref directly:
//   counterRef.value = 5;
//   await nextTick();
```
