# Component Testing

## mount vs shallowMount

- **`shallowMount`** — stubs all child components. Default choice for unit tests; isolates the component under test.
- **`mount`** — renders all children. Use when the test relies on actual child behaviour (e.g. slot content, child events).

## Wrapper factory (always a function)

```typescript
const getDefaultProps = () => ({
  label: "test-label",
  isCollapsed: false,
  items: [],
});

const getWrapper = (props = getDefaultProps()) =>
  shallowMount(MyComponent, { props });

// Override only what the test cares about
it("shows collapsed state", () => {
  const wrapper = getWrapper({ ...getDefaultProps(), isCollapsed: true });
  expect(wrapper.find(".content").exists()).toBe(false);
});
```

Props factory must be a **function**, not a `const` object — objects are reference types and mutations leak between tests.

## mount with global options

```typescript
const getWrapper = (props = getDefaultProps()) =>
  mount(MyComponent, {
    props,
    global: {
      provide: { mediafileViewerContext: "default" },
      mocks: { $t: (key: string) => key },
      stubs: {
        IIIFViewer: { template: '<div class="iiif-stub" />' },
        unicon: { template: '<span />', props: ["name", "height", "width"] },
      },
    },
    attachTo: document.body, // when tests need real DOM measurements
  });
```

## Querying elements

```typescript
// Preferred — survives CSS refactors
wrapper.find('[data-cy="metadata-value"]')
wrapper.find('[data-testid="submit-button"]')
wrapper.find('button[type="submit"]')
wrapper.findComponent({ name: "BaseButtonNew" })
wrapper.findAllComponents({ name: "BaseButtonNew" })

// Acceptable for semantic HTML
wrapper.find("input")
wrapper.find("label")

// Avoid — internal class names are implementation details
wrapper.find(".my-internal-class")
```

## Testing props → rendered output

```typescript
it("displays the label prop", () => {
  const wrapper = getWrapper({ ...getDefaultProps(), label: "Custom" });
  expect(wrapper.text()).toContain("Custom");
});

it("adds disabled attribute when isDisabled is true", () => {
  const wrapper = getWrapper({ ...getDefaultProps(), isDisabled: true });
  expect(wrapper.find("button").attributes("disabled")).toBeDefined();
});
```

## Testing emitted events

```typescript
it("emits update:modelValue with the entered text", async () => {
  const wrapper = getWrapper();
  await wrapper.find("input").setValue("hello");

  const emitted = wrapper.emitted("update:modelValue");
  expect(emitted).toBeTruthy();
  expect(emitted![emitted!.length - 1][0]).toBe("hello");
});

// Named events without payload
expect(wrapper.emitted("hideModal")).toBeTruthy();

// Event with expected payload
expect(wrapper.emitted("update:modalState")?.[0]).toEqual(["hide"]);
```

## Updating props after mount

```typescript
await wrapper.setProps({ isExpanded: true });
await wrapper.vm.$nextTick();
expect(wrapper.find(".panel-body").exists()).toBe(true);
```

## Conditional rendering

```typescript
it("shows error when error prop is set", () => {
  const wrapper = getWrapper({ ...getDefaultProps(), error: "Oops" });
  expect(wrapper.find('[data-cy="error-message"]').exists()).toBe(true);
  expect(wrapper.find('[data-cy="error-message"]').text()).toBe("Oops");
});

it("hides error when no error", () => {
  const wrapper = getWrapper();
  expect(wrapper.find('[data-cy="error-message"]').exists()).toBe(false);
});
```

## CSS class assertions

```typescript
expect(dialog.classes()).toContain("m-auto");
expect(classElement.classList.contains("border-red-default")).toBe(true);
```

## XSS / sanitization testing

```typescript
it("strips dangerous attributes from rendered HTML", () => {
  const wrapper = mount(SanitizedHtml, {
    props: { html: '<img src=x onerror=alert(1)>' },
  });
  expect(wrapper.html()).not.toContain("onerror");
  expect(wrapper.html()).not.toContain("alert");
});

it("preserves safe content", () => {
  const wrapper = mount(SanitizedHtml, {
    props: { html: "<p><strong>Bold</strong></p>" },
  });
  expect(wrapper.html()).toContain("<strong>Bold</strong>");
});
```
