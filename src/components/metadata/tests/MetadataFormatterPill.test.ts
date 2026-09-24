import { mount } from "@vue/test-utils";
import MetadataFormatterPill from "../MetadataFormatterPill.vue";
import { nextTick } from "vue";
import { describe, it, expect, vi } from "vitest";
import { Unicons } from "@/types";

vi.mock("@/main", () => ({
  formattersSettings: {
    pill: {
      concept: { background: "#aaa", text: "#fff" },
      queued: { background: "#eee", text: "#444", icon: "Process", spin: true },
      finished: { background: "#dfd", text: "#0b8" },
    },
  },
}));

const mocks = vi.hoisted(() => ({ t: vi.fn() }));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: mocks.t }),
}));

describe("MetadataFormatterPill", () => {
  describe("displayValue", () => {
    it("shows raw label when no translationKey", async () => {
      mocks.t.mockReturnValue("metadata.labels.production-status.concept");
      const wrapper = mount(MetadataFormatterPill, {
        props: { formatter: "pill", label: "concept" },
      });
      await nextTick();
      expect(wrapper.text()).toBe("concept");
    });

    it("translates when translationKey is a direct i18n key (option label style)", async () => {
      mocks.t.mockReturnValue("Concept");
      const wrapper = mount(MetadataFormatterPill, {
        props: {
          formatter: "pill",
          label: "concept",
          translationKey: "metadata.labels.production-status.concept",
        },
      });
      await nextTick();
      expect(wrapper.text()).toBe("Concept");
      expect(mocks.t).toHaveBeenCalledWith(
        "metadata.labels.production-status.concept",
      );
    });

    it("translates when translationKey contains $value placeholder", async () => {
      mocks.t.mockReturnValue("Concept");
      const wrapper = mount(MetadataFormatterPill, {
        props: {
          formatter: "pill",
          label: "concept",
          translationKey: "production-status.$value",
        },
      });
      await nextTick();
      expect(wrapper.text()).toBe("Concept");
      expect(mocks.t).toHaveBeenCalledWith("production-status.concept");
    });

    it("falls back to raw label when translationKey has no match", async () => {
      mocks.t.mockReturnValue("production-status.concept");
      const wrapper = mount(MetadataFormatterPill, {
        props: {
          formatter: "pill",
          label: "concept",
          translationKey: "production-status.$value",
        },
      });
      await nextTick();
      expect(wrapper.text()).toBe("concept");
    });
  });
});

describe("MetadataFormatterPill — multi-value fields", () => {
  const rolesOptions = [
    {
      label: "dropdown-labels.token-role-partner-read",
      value: "partner_read",
    },
    { label: "dropdown-labels.token-role-admin", value: "admin" },
  ];

  const TRANSLATIONS: Record<string, string> = {
    "dropdown-labels.token-role-partner-read": "Alleen lezen (partner)",
    "dropdown-labels.token-role-admin": "Beheerder",
  };

  it("translates every entry through the field options when there is no single key", async () => {
    // one $value pattern cannot cover partner_read -> ...-partner-read and
    // admin -> ...-admin, so no translationKey is resolvable for the field
    mocks.t.mockImplementation((key: string) => TRANSLATIONS[key] ?? key);
    const wrapper = mount(MetadataFormatterPill, {
      props: {
        formatter: "pill",
        label: ["partner_read", "admin"],
        valueOptions: rolesOptions,
      },
    });
    await nextTick();

    expect(wrapper.text()).toContain("Alleen lezen (partner)");
    expect(wrapper.text()).toContain("Beheerder");
    expect(wrapper.text()).not.toContain("partner_read");
  });

  it("keeps an entry raw when no option matches", async () => {
    mocks.t.mockImplementation((key: string) => TRANSLATIONS[key] ?? key);
    const wrapper = mount(MetadataFormatterPill, {
      props: {
        formatter: "pill",
        label: ["mystery_role"],
        valueOptions: rolesOptions,
      },
    });
    await nextTick();

    expect(wrapper.text()).toBe("mystery_role");
  });

  it("still prefers an explicit translationKey over the options", async () => {
    mocks.t.mockImplementation((key: string) =>
      key === "explicit.partner_read" ? "Explicit" : key,
    );
    const wrapper = mount(MetadataFormatterPill, {
      props: {
        formatter: "pill",
        label: ["partner_read"],
        translationKey: "explicit.$value",
        valueOptions: rolesOptions,
      },
    });
    await nextTick();

    expect(wrapper.text()).toBe("Explicit");
  });

  it("renders one pill per entry", async () => {
    mocks.t.mockImplementation((key: string) => TRANSLATIONS[key] ?? key);
    const wrapper = mount(MetadataFormatterPill, {
      props: {
        formatter: "pill",
        label: ["partner_read", "admin"],
        valueOptions: rolesOptions,
      },
    });
    await nextTick();

    // the root div is the flex container; each child is one pill
    expect(wrapper.element.children.length).toBe(2);
  });
});

describe("MetadataFormatterPill — configured icon", () => {
  it("renders the configured icon, spinning", async () => {
    mocks.t.mockImplementation((key: string) => key);
    const wrapper = mount(MetadataFormatterPill, {
      props: { formatter: "pill", label: "queued" },
      global: { stubs: { unicon: true } },
    });
    await nextTick();

    const icon = wrapper.find("unicon-stub");
    expect(icon.exists()).toBe(true);
    expect(icon.attributes("name")).toBe(Unicons.Process.name);
    expect(icon.classes()).toContain("animate-spin");
  });

  it("renders no icon when the pill config has none", async () => {
    mocks.t.mockImplementation((key: string) => key);
    const wrapper = mount(MetadataFormatterPill, {
      props: { formatter: "pill", label: "finished" },
      global: { stubs: { unicon: true } },
    });
    await nextTick();

    expect(wrapper.find("unicon-stub").exists()).toBe(false);
  });
});

describe("MetadataFormatterPill — nested relation metadata", () => {
  const organizationsWithFunctions = [
    {
      label: "Org A",
      values: [
        { key: "function", value: "programmer" },
        { key: "function", value: "technician" },
      ],
    },
    { label: "Org B", values: [] },
  ];

  it("renders one outer pill per entry with its own values inside", async () => {
    mocks.t.mockImplementation((key: string) => key);
    const wrapper = mount(MetadataFormatterPill, {
      props: {
        formatter: "pill|organization",
        label: organizationsWithFunctions,
      },
    });
    await nextTick();

    expect(wrapper.element.children.length).toBe(2);
    const [first, second] = wrapper.element.children;
    expect(first.textContent).toContain("Org A");
    expect(first.textContent).toContain("programmer");
    expect(first.textContent).toContain("technician");
    expect(second.textContent).toContain("Org B");
    expect(second.textContent).not.toContain("programmer");
  });

  it("translates the nested values but never the outer label", async () => {
    mocks.t.mockImplementation((key: string) =>
      key === "metadata.labels.user-function.programmer" ? "Programmator" : key,
    );
    const wrapper = mount(MetadataFormatterPill, {
      props: {
        formatter: "pill|organization",
        label: [
          {
            label: "Org A",
            values: [{ key: "function", value: "programmer" }],
          },
        ],
        translationKey: "metadata.labels.user-function.$value",
      },
    });
    await nextTick();

    expect(wrapper.text()).toContain("Org A");
    expect(wrapper.text()).toContain("Programmator");
    expect(mocks.t).not.toHaveBeenCalledWith(
      "metadata.labels.user-function.Org A",
    );
  });

  it("keeps the nested values visually distinct from the relation label", async () => {
    mocks.t.mockImplementation((key: string) => key);
    const wrapper = mount(MetadataFormatterPill, {
      props: {
        formatter: "pill|organization",
        label: [
          {
            label: "Org A",
            values: [{ key: "function", value: "programmer" }],
          },
        ],
      },
    });
    await nextTick();

    const nested = wrapper
      .findAll("span")
      .find((span) => span.text() === "programmer");
    expect(nested?.classes()).toEqual(
      expect.arrayContaining(["rounded-full", "bg-white", "border"]),
    );
  });

  it("gives the relation pill a default colour when the client configured none", async () => {
    mocks.t.mockImplementation((key: string) => key);
    const wrapper = mount(MetadataFormatterPill, {
      props: {
        formatter: "pill|organization",
        label: [{ label: "Org A", values: [] }],
      },
    });
    await nextTick();

    expect(wrapper.element.children[0].getAttribute("style")).toContain(
      "background",
    );
  });

  it("lets the client override the relation pill colour", async () => {
    mocks.t.mockImplementation((key: string) => key);
    const wrapper = mount(MetadataFormatterPill, {
      props: {
        formatter: "pill|concept",
        label: [{ label: "Org A", values: [] }],
      },
    });
    await nextTick();

    expect(wrapper.element.children[0].getAttribute("style")).toContain(
      "rgb(170, 170, 170)",
    );
  });

  it("colours a nested value by its own value, not by the relation pill type", async () => {
    mocks.t.mockImplementation((key: string) => key);
    const wrapper = mount(MetadataFormatterPill, {
      props: {
        formatter: "pill|concept",
        label: [
          {
            label: "Org A",
            values: [
              { key: "function", value: "finished" },
              { key: "function", value: "programmer" },
            ],
          },
        ],
      },
    });
    await nextTick();

    const spans = wrapper.findAll("span");
    const configured = spans.find((span) => span.text() === "finished");
    const unconfigured = spans.find((span) => span.text() === "programmer");
    expect(configured?.attributes("style")).toContain("rgb(221, 255, 221)");
    expect(unconfigured?.attributes("style") ?? "").not.toContain(
      "rgb(170, 170, 170)",
    );
  });

  it("colours each relation by its own name when no pill type is configured", async () => {
    mocks.t.mockImplementation((key: string) => key);
    const wrapper = mount(MetadataFormatterPill, {
      props: {
        formatter: "pill",
        label: [
          { label: "Concept", values: [] },
          { label: "Org without an entry", values: [] },
        ],
      },
    });
    await nextTick();

    const [configured, fallback] = wrapper.element.children;
    expect(configured.getAttribute("style")).toContain("rgb(170, 170, 170)");
    expect(fallback.getAttribute("style")).toContain("rgb(214, 226, 240)");
  });

  it("titles each nested value with the metadata it came from", async () => {
    mocks.t.mockImplementation(
      (key: string) =>
        ({
          "metadata.labels.function": "Functie",
          "metadata.labels.user-function.programmer": "Programmator",
        })[key] ?? key,
    );
    const wrapper = mount(MetadataFormatterPill, {
      props: {
        formatter: "pill|organization",
        label: [
          {
            label: "Org A",
            values: [
              { key: "function", value: "programmer" },
              { key: "roles", value: "admin" },
            ],
          },
        ],
        translationKey: "metadata.labels.user-function.$value",
      },
    });
    await nextTick();

    const spans = wrapper.findAll("span");
    expect(
      spans.find((span) => span.text() === "Programmator")?.attributes("title"),
    ).toBe("Functie: Programmator");
    // no translation for the key, so the raw key names it rather than nothing
    expect(
      spans.find((span) => span.text() === "admin")?.attributes("title"),
    ).toBe("roles: admin");
  });

  it("still renders nested values given as plain strings", async () => {
    mocks.t.mockImplementation((key: string) => key);
    const wrapper = mount(MetadataFormatterPill, {
      props: {
        formatter: "pill|organization",
        label: [{ label: "Org A", values: ["programmer"] }],
      },
    });
    await nextTick();

    expect(wrapper.text()).toContain("programmer");
  });

  it("renders a bare pill for an entry without values", async () => {
    mocks.t.mockImplementation((key: string) => key);
    const wrapper = mount(MetadataFormatterPill, {
      props: {
        formatter: "pill|organization",
        label: [{ label: "Org B", values: [] }],
      },
    });
    await nextTick();

    expect(wrapper.text()).toBe("Org B");
  });
});
