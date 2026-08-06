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

**Always `await` `importOriginal()`/`vi.importActual()`.** If the factory isn't `async` or the call
isn't awaited, the real module import still fires — just as an orphaned, untracked background
promise. If that promise settles *after* Vitest tears down that test file's environment (a timing
race that depends on machine load), you get an `EnvironmentTeardownError`, attributed to whatever
test happens to be running at that moment, not the test that actually caused it. This reliably
passes locally and fails intermittently in CI, which is what makes it easy to miss:

```typescript
// BROKEN — actualModule is a Promise; the real import is never awaited
vi.mock("@/helpers", () => {
  const actualModule = vi.importActual("@/helpers"); // ❌ no await, no async factory
  return { ...actualModule, someExport: vi.fn() };
});
```

## Never partial-mock `@/main` — it self-invokes app bootstrap

`src/main.ts` calls `start()` unconditionally at module scope (real router/App creation, network
calls via `getApplicationDetails()`, etc.). Partial-mocking it with `importActual`/`importOriginal`
actually executes that bootstrap in the test process — at best slow, at worst it throws confusing
errors deep in unrelated composables (e.g. `usePermissions is not a function`). Combined with the
unawaited-import pitfall above, this was the exact cause of a flaky-CI-only test failure.

`@/main`'s exports (`apolloClient`, `auth`, `router`, `i18n`, ...) are just live bindings — tests
only need shaped stand-ins, never the real thing. Mock it fully static, no `importActual`:

```typescript
vi.mock("@/main", () => ({
  apolloClient: {
    query: vi.fn().mockResolvedValue({ data: {} }),
  },
  auth: {
    isAuthenticated: ref(true),
  },
}));
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
