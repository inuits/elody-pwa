import { mount, shallowMount } from "@vue/test-utils";
import MenuSubItem from "../MenuSubItem.vue";
import { describe, it, expect, vi } from "vitest";

// Mock the useI18n and usePermissions composables
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({
    openModal: vi.fn(() => true),
  }),
}));

vi.mock("@vue/apollo-composable", () => ({
  useQuery: vi.fn(() => ({
    onResult: vi.fn((callback) =>
      callback({
        data: { menu: { items: ["item1", "item2"] } }, // Mocked response data
      })
    ),
    onError: vi.fn(), // Mock onError if used
  })),
}));

vi.mock("@/composables/usePermissions", () => ({
  usePermissions: () => ({
    can: vi.fn(() => true), // Default to permission granted
    fetchCanPermission: vi.fn(() => Promise.resolve(true)),
  }),
}));

vi.mock("vue-router", () => ({
  useRoute: () => ({
    path: "/test-path",
  }),
}));

// Mock the Unicons
vi.mock("@/types", () => ({
  Unicons: {
    Plus: { name: "plus" },
  },
}));

describe("MenuSubItem", () => {
  const subMenuItem = {
    label: "Test Item",
    can: "can-view", // permission prop
    typeLink: {
      route: {
        destination: "/test-path",
      },
    },
  };

  it("renders the component if permission is granted", async () => {
    const wrapper = shallowMount(MenuSubItem, {
      props: {
        show: true,
        subMenuItem,
      },
    });

    console.log(wrapper);
    // Wait for any async operations to resolve
    await wrapper.vm.$nextTick();

    const menuItem = wrapper.find('[data-cy="menu-sub-item"]');

    console.log(menuItem);
    expect(menuItem.exists()).toBe(true);
  });

  // it("hides the component if permission is not granted", async () => {
  //   const fetchCanPermissionMock = vi.fn().mockResolvedValueOnce(false); // Simulate permission not granted

  //   vi.mock("@/composables/usePermissions", () => ({
  //     usePermissions: () => ({
  //       can: vi.fn(() => false),
  //       fetchCanPermission: fetchCanPermissionMock,
  //     }),
  //   }));

  //   const wrapper = mount(MenuSubItem, {
  //     props: {
  //       show: true,
  //       subMenuItem,
  //     },
  //   });

  //   // Wait for any async operations to resolve
  //   await wrapper.vm.$nextTick();

  //   const menuItem = wrapper.find('[data-cy="menu-sub-item"]');
  //   expect(menuItem.exists()).toBe(false);
  // });

  // it("hides the component if `show` is false", async () => {
  //   const wrapper = mount(MenuSubItem, {
  //     props: {
  //       show: false, // `show` prop is false
  //       subMenuItem,
  //     },
  //   });

  //   // Wait for any async operations to resolve
  //   await wrapper.vm.$nextTick();

  //   const menuItem = wrapper.find('[data-cy="menu-sub-item"]');
  //   expect(menuItem.exists()).toBe(false);
  // });
});
