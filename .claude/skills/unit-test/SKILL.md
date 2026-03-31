---
name: unit-test
description: >
  Use this skill whenever writing, reviewing, or fixing unit tests in inuits-dams-pwa.
  Applies to all *.test.ts files in src/**/__tests__/ or src/**/tests/.
  Trigger on: "write a test for X", "add tests", "how do I test this composable/component",
  "my test is failing", "mock this dependency", or any time new code is written and needs
  accompanying tests (TDD policy: test first, then implementation).
---

# Unit Testing — inuits-dams-pwa

**Stack**: Vitest + `@vue/test-utils` + TypeScript
**Test locations**: `src/**/__tests__/*.test.ts` · `src/**/tests/*.test.ts`
**Run**: `pnpm test:unit`
**Rule**: Write tests FIRST, then implementation (TDD — CLAUDE.md).

---

## Standard file skeleton

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, shallowMount, flushPromises } from "@vue/test-utils";

// 1. Hoisted mutable state (only needed when mock values change between tests)
const mocks = vi.hoisted(() => ({
  advancedPermissions: {} as Record<string, boolean>,
}));

// 2. Module mocks (always hoisted by Vitest regardless of position)
vi.mock("@/composables/usePermissions", () => ({
  usePermissions: () => ({ advancedPermissions: mocks.advancedPermissions }),
  advancedPermissions: mocks.advancedPermissions,
}));

// 3. Prop/data factories — always functions, never shared objects
const getDefaultProps = () => ({ label: "test", isDisabled: false });
const getWrapper = (props = getDefaultProps()) =>
  shallowMount(MyComponent, { props });

describe("MyComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.advancedPermissions = {};   // reset hoisted state
  });
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("renders the label", () => {
    const wrapper = getWrapper();
    expect(wrapper.text()).toContain("test");
  });
});
```

---

## Key rules

1. **TDD** — test file first, implementation second. No exceptions.
2. **One concept per `it`** — never assert two unrelated things in one test.
3. **Independent tests** — no shared mutable state between cases. Reset in `beforeEach`.
4. **Black-box** — test what it *does*, not how it does it internally.
5. **No snapshot-only tests** — use explicit `expect` assertions.
6. **Readable names** — `it("disables submit when form is invalid")` reads as a spec.

---

## Decision table

| What you need | Use |
|---|---|
| Component in isolation | `shallowMount` (default) |
| Component + real children | `mount` |
| Composable (no lifecycle hooks) | call directly, no wrapper |
| Composable with `onMounted`/`provide` | `withSetup` helper — see [composable-testing](references/composable-testing.md) |
| Mock entire module | `vi.mock(...)` |
| Keep real module, override one export | `vi.mock` + `importActual` — see [mocking](references/mocking.md) |
| Mock value differs between tests | `vi.hoisted` — see [mocking](references/mocking.md) |
| Apollo `useQuery`/`useMutation` | see [apollo-testing](references/apollo-testing.md) |
| Async ops / API calls | `await flushPromises()` |
| Reactive DOM update only | `await nextTick()` or `await wrapper.vm.$nextTick()` |
| Emitted events | `wrapper.emitted("eventName")` |
| DOM interaction | `wrapper.find(...)` + `.trigger(...)` / `.setValue(...)` |

---

## Reference files

- [mocking](references/mocking.md) — `vi.mock`, `vi.hoisted`, `importActual`, stubs, spy, reset table
- [component-testing](references/component-testing.md) — mounting options, events, props, DOM queries, XSS
- [composable-testing](references/composable-testing.md) — direct calls, `withSetup`, reactive state, async composables
- [apollo-testing](references/apollo-testing.md) — `useQuery`/`useMutation` mocks, loading/error states
- [async-testing](references/async-testing.md) — `flushPromises`, `nextTick`, fake timers, async error paths
