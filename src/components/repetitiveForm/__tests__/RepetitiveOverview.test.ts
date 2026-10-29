import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { Entitytyping } from "@/generated-types/queries";
import RepetitiveOverview from "@/components/repetitiveForm/RepetitiveOverview.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

const steps = [
  {
    key: "work",
    label: "repetitiveForm.step-work",
    entityType: Entitytyping.Work,
    createForm: "x",
  },
  { key: "expression", entityType: Entitytyping.Expression, createForm: "y" },
];

const branches = [
  {
    entities: {
      work: [
        {
          key: "work",
          id: "work-1",
          type: Entitytyping.Work,
          label: "Harry Potter",
          isNew: false,
          details: [{ label: "metadata.labels.author", value: "Rowling" }],
        },
      ],
      expression: [
        { key: "expression", id: "expr-1", type: Entitytyping.Expression, label: undefined, isNew: true },
      ],
    },
  },
];

// a multi-select step fans out into one branch per picked entity, so the
// overview shows one row each — individually removable
const personBranch = (id: string, label: string) => ({
  entities: {
    author: [{ key: "author", id, type: Entitytyping.Person, label, isNew: false }],
    relation_metadata: [
      {
        key: "relation_metadata",
        id: "",
        type: Entitytyping.Person,
        isNew: false,
        details: [{ label: "metadata.labels.function-indication", value: "auteur" }],
      },
    ],
  },
});

const getWrapper = (props: any = { branches, steps, repeatable: true }) =>
  mount(RepetitiveOverview, {
    props,
    global: { mocks: { $t: (k: string) => k }, stubs: { unicon: true } },
  });

describe("RepetitiveOverview", () => {
  it("renders one list row per staged branch", () => {
    const wrapper = getWrapper();
    expect(wrapper.findAll("[data-testid='repetitive-overview-row']")).toHaveLength(1);
  });

  it("shows the step label and each entity's label, falling back to id", () => {
    const row = getWrapper().find("[data-testid='repetitive-overview-row']").text();
    expect(row).toContain("repetitiveForm.step-work"); // configured step label
    expect(row).toContain("expression"); // step key fallback
    expect(row).toContain("Harry Potter"); // picked work → label
    expect(row).toContain("expr-1"); // created expression → no label → id
  });

  it("shows each staged entity's details in its row", () => {
    const row = getWrapper().find("[data-testid='repetitive-overview-row']").text();
    expect(row).toContain("metadata.labels.author");
    expect(row).toContain("Rowling");
  });

  it("renders configured overviewFields from the entity values instead of the derived details", () => {
    const wrapper = getWrapper({
      branches: [
        {
          entities: {
            work: [
              {
                key: "work",
                id: "work-1",
                type: Entitytyping.Work,
                label: "Harry Potter",
                isNew: false,
                details: [{ label: "derived", value: "should not show" }],
                values: {
                  original_headtitle: "Harry Potter", // equals label → skipped
                  original_subtitle: "De gevangene",
                  literary_type: "Fictie",
                  refLanguages: ["Nederlands", "Engels"],
                  work_type: "work_word", // not configured → not shown
                },
              },
            ],
          },
        },
      ],
      steps: [
        {
          key: "work",
          label: "repetitiveForm.step-work",
          entityType: Entitytyping.Work,
          createForm: "x",
          overviewFields: [
            { key: "original_headtitle", label: "metadata.labels.headtitle" },
            { key: "original_subtitle", label: "metadata.labels.subtitle" },
            { key: "literary_type", label: "metadata.labels.literary-type" },
            { key: "refLanguages", label: "metadata.labels.original-language" },
          ],
        },
      ],
      repeatable: true,
    });
    const row = wrapper.find("[data-testid='repetitive-overview-row']").text();
    expect(row).toContain("metadata.labels.subtitle");
    expect(row).toContain("De gevangene");
    expect(row).toContain("Fictie");
    expect(row).toContain("Nederlands, Engels");
    // the configured field equal to the displayed label is not repeated
    expect(row).not.toContain("metadata.labels.headtitle");
    expect(row).not.toContain("work_type");
    expect(row).not.toContain("should not show");
  });

  it("shows a metadataOnly step's collected values via details, without a — placeholder for its (nonexistent) label", () => {
    const wrapper = getWrapper({
      branches: [
        {
          entities: {
            work: branches[0].entities.work,
            role: [
              {
                key: "role",
                id: "",
                type: Entitytyping.User,
                isNew: false,
                details: [
                  { label: "metadata.labels.role", value: "booker_admin" },
                  { label: "metadata.labels.function", value: "Coordinator" },
                ],
              },
            ],
          },
        },
      ],
      steps: [
        ...steps,
        { key: "role", label: "forms.add-existing-contact-person.tabs.role", entityType: Entitytyping.User, createForm: "z", metadataOnly: true },
      ],
      repeatable: true,
    });
    const row = wrapper.find("[data-testid='repetitive-overview-row']").text();
    expect(row).toContain("forms.add-existing-contact-person.tabs.role");
    expect(row).toContain("metadata.labels.role");
    expect(row).toContain("booker_admin");
    expect(row).toContain("metadata.labels.function");
    expect(row).toContain("Coordinator");
    // no "—" placeholder above the details for a step with no real label/id
    expect(row).not.toContain("—");
  });

  it("renders a row per entity of a multi-select pass, each with the shared relation metadata", () => {
    const wrapper = getWrapper({
      branches: [
        personBranch("person-1", "Jan Jansen"),
        personBranch("person-2", "Piet Peeters"),
        personBranch("corp-1", "VZW Boekenclub"),
      ],
      steps: [
        { key: "author", label: "forms.add-existing-author.tabs.author", entityType: Entitytyping.Person, createForm: "x" },
        { key: "relation_metadata", label: "forms.relation-metadata", entityType: Entitytyping.Person, createForm: "y", metadataOnly: true },
      ],
      repeatable: true,
    });
    const rows = wrapper.findAll("[data-testid='repetitive-overview-row']");
    expect(rows).toHaveLength(3);
    expect(rows.map((row) => row.text())).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Jan Jansen"),
        expect.stringContaining("Piet Peeters"),
        expect.stringContaining("VZW Boekenclub"),
      ]),
    );
    rows.forEach((row) => expect(row.text()).toContain("auteur"));
  });

  it("removes a single entity of a multi-select pass by its branch index (newest shown first)", async () => {
    const wrapper = getWrapper({
      branches: [personBranch("person-1", "Jan"), personBranch("person-2", "Piet")],
      steps: [{ key: "author", entityType: Entitytyping.Person, createForm: "x" }],
      repeatable: true,
    });
    await wrapper
      .findAll("[data-testid='repetitive-overview-remove']")[1]
      .trigger("click");
    // the second row shown is the older chain, Jan (branch 0)
    expect(wrapper.emitted("remove")?.[0]).toEqual([0]);
  });

  it("emits remove with the row index when the row's delete button is clicked", async () => {
    const wrapper = getWrapper();
    await wrapper
      .find("[data-testid='repetitive-overview-remove']")
      .trigger("click");
    expect(wrapper.emitted("remove")?.[0]).toEqual([0]);
  });

  it("shows an empty-state message instead of the list when nothing is staged", () => {
    const wrapper = getWrapper({ branches: [], steps, repeatable: true });
    expect(wrapper.find("[data-testid='repetitive-overview-empty']").exists()).toBe(true);
    expect(wrapper.find("[data-testid='repetitive-overview-list']").exists()).toBe(false);
  });

  it("is a polite log of what this session created", () => {
    const list = getWrapper().find("[data-testid='repetitive-overview-list']");
    expect(list.attributes("role")).toBe("log");
    expect(list.attributes("aria-live")).toBe("polite");
  });

  it("puts the newest chain on top", () => {
    const wrapper = getWrapper({
      branches: [personBranch("person-1", "Jan"), personBranch("person-2", "Piet")],
      steps: [{ key: "author", entityType: Entitytyping.Person, createForm: "x" }],
      repeatable: true,
    });
    const rows = wrapper.findAll("[data-testid='repetitive-overview-row']");
    expect(rows[0].text()).toContain("Piet");
    expect(rows[1].text()).toContain("Jan");
  });

  it("checks every saved row", () => {
    const row = getWrapper().find("[data-testid='repetitive-overview-row']");
    expect(row.find("[data-testid='repetitive-overview-saved']").exists()).toBe(
      true,
    );
  });

  it("has no add or finish buttons of its own (the flow footer has them)", () => {
    const wrapper = getWrapper();
    expect(wrapper.find("[data-testid='repetitive-overview-add']").exists()).toBe(false);
    expect(wrapper.find("[data-testid='repetitive-overview-finish']").exists()).toBe(false);
  });

  it("names each icon-only remove button", () => {
    const remove = getWrapper().findAllComponents({ name: "BaseButtonNew" })
      .find((button) => button.attributes("data-testid") === "repetitive-overview-remove");

    expect(remove!.props("ariaLabel")).toBe("actions.labels.remove-item");
  });

  it("offers Undo on the newest row only, while undo is still possible", () => {
    const createdBranch = (id: string, label: string) => ({
      entities: {
        author: [{ key: "author", id, type: Entitytyping.Person, label, isNew: true }],
      },
    });
    const props = {
      branches: [createdBranch("p-1", "Jan"), createdBranch("p-2", "Piet")],
      steps: [{ key: "author", entityType: Entitytyping.Person, createForm: "x" }],
      repeatable: true,
      undoable: true,
    };
    const rows = getWrapper(props).findAll("[data-testid='repetitive-overview-row']");
    expect(rows[0].find("[data-testid='repetitive-overview-undo']").exists()).toBe(true);
    expect(rows[1].find("[data-testid='repetitive-overview-undo']").exists()).toBe(false);
    expect(
      getWrapper({ ...props, undoable: false })
        .find("[data-testid='repetitive-overview-undo']")
        .exists(),
    ).toBe(false);
  });

  it("offers no Undo for a chain that only picked existing records", () => {
    const wrapper = getWrapper({
      branches: [personBranch("person-1", "Jan")],
      steps: [{ key: "author", entityType: Entitytyping.Person, createForm: "x" }],
      repeatable: true,
      undoable: true,
    });
    expect(wrapper.find("[data-testid='repetitive-overview-undo']").exists()).toBe(false);
  });

  it("emits undo with the branch index", async () => {
    const wrapper = getWrapper({
      branches: [
        { entities: { author: [{ key: "author", id: "p-1", type: Entitytyping.Person, label: "Jan", isNew: true }] } },
      ],
      steps: [{ key: "author", entityType: Entitytyping.Person, createForm: "x" }],
      repeatable: true,
      undoable: true,
    });
    await wrapper.find("[data-testid='repetitive-overview-undo']").trigger("click");
    expect(wrapper.emitted("undo")?.[0]).toEqual([0]);
  });
});
