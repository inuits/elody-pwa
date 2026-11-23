import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import LanguageSelect from "../LanguageSelect.vue";

vi.unmock("vue-i18n");

const mocks = vi.hoisted(() => ({
  displayPreferences: undefined as { lang?: string } | undefined,
}));

vi.mock("@/composables/useStateManagement", () => ({
  useStateManagement: () => ({
    getGlobalState: () => mocks.displayPreferences,
    updateGlobalState: vi.fn(),
  }),
}));
vi.mock("@/composables/useEdit", () => ({
  useEditMode: () => ({ isEdit: false }),
}));
vi.mock("@/composables/useConfirmModal", () => ({
  useConfirmModal: () => ({ confirm: vi.fn() }),
}));
vi.mock("vue-router", () => ({
  useRoute: () => ({ params: { id: "PR-1" } }),
}));
vi.mock("@vee-validate/i18n", () => ({ setLocale: vi.fn() }));

const getWrapper = () =>
  mount(LanguageSelect, {
    global: {
      plugins: [
        createI18n({
          legacy: false,
          locale: "en",
          messages: { en: {}, nl: {} },
        }),
      ],
      provide: { config: { features: {} } },
      stubs: { AdvancedDropdown: true },
    },
  });

describe("LanguageSelect", () => {
  beforeEach(() => {
    mocks.displayPreferences = undefined;
    document.documentElement.lang = "";
  });

  it("sets the page language to the current locale", () => {
    getWrapper();

    expect(document.documentElement.lang).toBe("en");
  });

  it("sets the page language to the stored preference", () => {
    mocks.displayPreferences = { lang: "nl" };

    getWrapper();

    expect(document.documentElement.lang).toBe("nl");
  });

  it("updates the page language when another language is chosen", async () => {
    const wrapper = getWrapper();

    wrapper
      .findComponent({ name: "AdvancedDropdown" })
      .vm.$emit("update:model-value", "nl");
    await flushPromises();

    expect(document.documentElement.lang).toBe("nl");
  });
});
