# Apollo Testing

Mock at the module boundary — never rely on a real Apollo client in unit tests.

## Mocking useQuery

```typescript
const mockApolloQuery = vi.fn();
vi.mock("@vue/apollo-composable", () => ({
  useQuery: mockApolloQuery,
  useMutation: vi.fn(),
}));

// Helper for a realistic query result shape
const createMockQueryResult = <T>(data: T) => ({
  data,
  loading: false,
  networkStatus: 7,
  error: undefined,
});

beforeEach(() => {
  vi.clearAllMocks();
});

it("renders data from the query", async () => {
  mockApolloQuery.mockResolvedValueOnce(
    createMockQueryResult({ entity: { id: "1", title: "My Entity" } })
  );

  const wrapper = mount(MyComponent);
  await flushPromises();

  expect(wrapper.text()).toContain("My Entity");
});

it("shows loading state", () => {
  mockApolloQuery.mockReturnValue({
    result: { value: null },
    loading: { value: true },
    error: { value: undefined },
    refetch: vi.fn(),
  });

  const wrapper = mount(MyComponent);
  expect(wrapper.find('[data-cy="loading-spinner"]').exists()).toBe(true);
});

it("shows error state", async () => {
  mockApolloQuery.mockReturnValue({
    result: { value: null },
    loading: { value: false },
    error: { value: new Error("Network error") },
    refetch: vi.fn(),
  });

  const wrapper = mount(MyComponent);
  await flushPromises();
  expect(wrapper.find('[data-cy="error-message"]').exists()).toBe(true);
});
```

## Mocking useMutation

```typescript
const mockMutate = vi.fn();
vi.mock("@vue/apollo-composable", () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn().mockReturnValue({
    mutate: mockMutate,
    loading: { value: false },
    error: { value: undefined },
    onDone: vi.fn(),
    onError: vi.fn(),
  }),
}));

it("calls the mutation with correct variables", async () => {
  mockMutate.mockResolvedValue({ data: { updateEntity: { id: "1" } } });

  const wrapper = mount(MyFormComponent);
  await wrapper.find('input[name="title"]').setValue("New Title");
  await wrapper.find("form").trigger("submit");
  await flushPromises();

  expect(mockMutate).toHaveBeenCalledWith({ id: "1", title: "New Title" });
});
```

## apolloClient.query (direct client calls)

Some composables use `apolloClient.query` directly rather than `useQuery`:

```typescript
vi.mock("@/main", () => ({
  auth: { isAuthenticated: { value: true } },
  apolloClient: {
    query: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

// Then per test:
import { apolloClient } from "@/main";
vi.mocked(apolloClient.query).mockResolvedValueOnce({
  data: { entities: [{ id: "1" }] },
});
```
