# Mocking

## Basic module mock

```typescript
vi.mock("@/composables/usePermissions", () => ({
  usePermissions: () => ({
    can: vi.fn(),
    fetchAdvancedPermission: vi.fn(),
  }),
}));
```

## vi.hoisted — mutable state across tests

Use when the mock return value needs to differ between tests. The factory passed to
`vi.hoisted` runs before any imports, so the variable is safe to reference inside `vi.mock`.

```typescript
const mocks = vi.hoisted(() => ({
  advancedPermissions: {} as Record<string, boolean>,
  fetchAdvancedPermissions: vi.fn(),
}));

vi.mock("@/composables/usePermissions", () => ({
  usePermissions: () => ({
    can: mocks.fetchAdvancedPermissions,
    fetchAdvancedPermission: mocks.fetchAdvancedPermissions,
  }),
  advancedPermissions: mocks.advancedPermissions,
}));

// In beforeEach — reset the mutable state
beforeEach(() => {
  vi.clearAllMocks();
  mocks.advancedPermissions = {};
});

// In a test — set before mounting
it("hides button when permission is denied", async () => {
  mocks.advancedPermissions["entity:delete"] = false;
  const wrapper = getWrapper();
  await flushPromises();
  expect(wrapper.vm.availableOptions.length).toBe(0);
});
```

## Partial mock — keep real module, override one export

```typescript
vi.mock(import("@/helpers"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    convertUnitToReadableFormat: vi.fn().mockImplementation(() => "value"),
  };
});
```

## Mock a default export

```typescript
vi.mock("@/services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));
```

## Mock a Vue component

```typescript
vi.mock("@/components/base/BaseModal.vue", () => ({
  default: {
    template: "<div><slot/></div>",
    props: ["modalType"],
  },
}));
```

## Stub child components at mount time

```typescript
const wrapper = mount(MyComponent, {
  global: {
    stubs: {
      IIIFViewer: { template: '<div class="iiif-stub" />' },
      unicon: { template: '<span class="unicon" />', props: ["name"] },
    },
  },
});
```

## vi.fn() control per test

```typescript
const mockFetch = vi.fn();

mockFetch.mockReturnValue("fixed");
mockFetch.mockReturnValueOnce("first").mockReturnValueOnce("second");
mockFetch.mockResolvedValue({ data: "ok" });
mockFetch.mockRejectedValueOnce(new Error("API Error"));
```

## Mock factory for a composable

```typescript
const createBaseModalMock = (overrides = {}) => ({
  getModalInfo: vi.fn(() => ({ open: true, modalStyle: ModalStyle.Center, ...overrides })),
  openModal: vi.fn(),
  closeModal: vi.fn(),
  closeAllModals: vi.fn(),
});

vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: vi.fn(() => createBaseModalMock()),
}));
```

## Spy on an existing method

```typescript
const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
// ... trigger warning ...
expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("deprecated"));
```

## Always mock useImport — never let it hit the real generated-types file

Any composable that calls `useImport()` (`loadDocument`/`loadQuery`/`loadQueryVariables`) reads
from `src/generated-types/queries.ts` via a **hardcoded absolute path**
(`import("/src/generated-types/queries.ts")`), not the `@/generated-types/queries` alias. The
`@/generated-types/queries` → `src/__mocks__/queries.ts` alias in `vitest.config.ts` therefore does
**not** intercept it. If a test doesn't mock `useImport` directly, calling `init`/anything that
triggers `loadDocument` dynamically imports the real generated file — 10k+ lines, ~14MB — which
takes seconds to transform on first import and can blow past the default 5000ms test timeout.

Always mock it explicitly, the same way in every test that touches such a composable:

```typescript
vi.mock("@/composables/useImport", () => ({
  useImport: () => ({
    loadDocument: vi.fn().mockResolvedValue("SOME_DOCUMENT"),
    loadQuery: vi.fn(),
    loadQueryVariables: vi.fn(),
  }),
}));
```

If the mock value needs to vary between tests, combine with `vi.hoisted` (see above) instead of a
bare `vi.fn()`, e.g. `mockLoadDocument: vi.fn().mockResolvedValue("ADD_ENTITY_RELATIONS_DOC")`.

## Reset table

| Method | Clears call history | Resets return values | Restores original |
|---|---|---|---|
| `vi.clearAllMocks()` | Yes | No | No |
| `vi.resetAllMocks()` | Yes | Yes | No |
| `vi.restoreAllMocks()` | Yes | Yes | Yes (spies only) |

**Standard pattern**: `clearAllMocks()` in `beforeEach`, `resetAllMocks()` in `afterEach`.
