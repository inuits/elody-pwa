import { describe, expect, it } from "vitest";
import { ref as vueRef } from "vue";
import {
  configurationForEntity,
  createInlineTagSuggestionExtension,
  isTaggedByTriggerOnly,
  suggestionStateFor,
} from "../inlineTagSuggestion";

const configurationWithTrigger = (tag: string, character: string) =>
  ({
    tag,
    inlineTrigger: { character, minCharacters: 1 },
  }) as any;

const pluginsFor = async (configurations: any[]) => {
  const extension = await createInlineTagSuggestionExtension(
    configurations,
    vueRef(null),
  );
  return extension!.config.addProseMirrorPlugins!.call({ editor: {} } as any);
};

describe("suggestionStateFor", () => {
  const propsWith = (query: string) => ({
    query,
    range: { from: 1, to: 2 },
    editor: { view: { coordsAtPos: () => ({ left: 5, bottom: 9 }) } },
  });

  it("stays closed until minCharacters is typed", () => {
    const configuration = configurationWithTrigger("entity", "#");
    configuration.inlineTrigger.minCharacters = 2;

    expect(suggestionStateFor([configuration], propsWith(""))).toBeNull();
    expect(suggestionStateFor([configuration], propsWith("h"))).toBeNull();
    expect(suggestionStateFor([configuration], propsWith("he"))).toMatchObject({
      query: "he",
    });
  });

  it("takes the lowest minimum when configurations share a trigger", () => {
    // @ lists users from one character; a group entry asking for two must not delay
    // the whole dropdown.
    const user = configurationWithTrigger("user", "@");
    const group = configurationWithTrigger("group", "@");
    group.inlineTrigger.minCharacters = 2;

    expect(suggestionStateFor([user, group], propsWith("a"))).toMatchObject({
      query: "a",
    });
  });

  it("requires one character when no minimum is configured", () => {
    const configuration = {
      extensionName: "w",
      tag: "w",
      inlineTrigger: { character: "@" },
    } as any;

    expect(suggestionStateFor([configuration], propsWith(""))).toBeNull();
    expect(suggestionStateFor([configuration], propsWith("a"))).not.toBeNull();
  });
});

describe("isTaggedByTriggerOnly", () => {
  it("is true when every configuration has a trigger", () => {
    expect(
      isTaggedByTriggerOnly([
        configurationWithTrigger("user", "@"),
        configurationWithTrigger("entity", "#"),
      ]),
    ).toBe(true);
  });

  it("is false when one configuration has no trigger", () => {
    // Mixed sets must keep the toolbar button: the trigger-less entry has no other
    // way to be tagged.
    expect(
      isTaggedByTriggerOnly([
        configurationWithTrigger("user", "@"),
        { extensionName: "w", tag: "w" } as any,
      ]),
    ).toBe(false);
  });

  it("is false for AICAP's trigger-less configuration", () => {
    expect(
      isTaggedByTriggerOnly([{ extensionName: "w", tag: "w" } as any]),
    ).toBe(false);
  });

  it("is false when there is no configuration at all", () => {
    // An empty set means the configuration entities have not resolved yet; hiding the
    // button here would make it flicker in once they do.
    expect(isTaggedByTriggerOnly([])).toBe(false);
  });
});

describe("configurationForEntity", () => {
  const user = { ...configurationWithTrigger("user", "@"), taggableEntityType: "user" };
  const group = { ...configurationWithTrigger("group", "@"), taggableEntityType: "group" };

  it("picks the configuration matching the entity's own type", () => {
    // Decides which tag element is inserted, and so which relation the comment
    // carries: refTaggedUsers vs refTaggedGroups.
    expect(configurationForEntity([user, group], { type: "group" })).toBe(group);
    expect(configurationForEntity([user, group], { type: "user" })).toBe(user);
  });

  it("falls back to the first for a type no configuration names", () => {
    // A BaseEntity configuration matches no single type by design.
    expect(configurationForEntity([user], { type: "work_word" })).toBe(user);
  });
});

describe("createInlineTagSuggestionExtension", () => {
  it("gives every trigger its own plugin key", async () => {
    const plugins = await pluginsFor([
      configurationWithTrigger("user", "@"),
      configurationWithTrigger("work", "#"),
    ]);

    const keys = plugins
      .map((plugin: any) => plugin.key)
      .filter((key: string) => key?.startsWith("suggestion-"));
    expect(keys).toHaveLength(2);
    expect(new Set(keys).size).toBe(2);
    expect(keys.some((key: string) => key.startsWith("suggestion-@"))).toBe(
      true,
    );
    expect(keys.some((key: string) => key.startsWith("suggestion-#"))).toBe(
      true,
    );
  });

  it("gives configurations sharing a trigger ONE plugin", async () => {
    // Two plugins with the same key make ProseMirror throw "Adding different
    // instances of a keyed plugin", which is why they share a dropdown instead.
    const plugins = await pluginsFor([
      configurationWithTrigger("user", "@"),
      configurationWithTrigger("group", "@"),
      configurationWithTrigger("entity", "#"),
    ]);

    const keys = plugins
      .map((plugin: any) => plugin.key)
      .filter((key: string) => key?.startsWith("suggestion-"));
    expect(keys).toHaveLength(2);
    expect(new Set(keys).size).toBe(2);
  });

  it("builds nothing when no configuration declares a trigger", async () => {
    const extension = await createInlineTagSuggestionExtension(
      [{ extensionName: "w", tag: "w" } as any],
      vueRef(null),
    );
    expect(extension).toBeUndefined();
  });
});
