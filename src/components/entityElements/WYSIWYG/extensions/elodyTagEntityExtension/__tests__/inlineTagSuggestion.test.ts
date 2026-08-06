/**
 * Guards the one thing that is easy to get wrong here: @tiptap/suggestion defaults to a
 * single shared PluginKey, so more than one trigger on the same editor makes ProseMirror
 * throw "Adding different instances of a keyed plugin (suggestion$)". vlacc ships two
 * triggers (`@` for users, `#` for works), so the default is never usable for us.
 */
import { describe, expect, it } from "vitest";
import { ref as vueRef } from "vue";
import {
  createInlineTagSuggestionExtension,
  isTaggedByTriggerOnly,
} from "../inlineTagSuggestion";

// Deliberately no extensionName: that field is only assigned when the node extensions are
// built, which happens AFTER the suggestion extension, so the plugin key must not depend
// on it. Setting it here would test an ordering the app never has.
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
  // addProseMirrorPlugins reads `this.editor`; nothing in it runs at construction time.
  return extension!.config.addProseMirrorPlugins!.call({ editor: {} } as any);
};

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

describe("createInlineTagSuggestionExtension", () => {
  it("gives every trigger its own plugin key", async () => {
    const plugins = await pluginsFor([
      configurationWithTrigger("user", "@"),
      configurationWithTrigger("work", "#"),
    ]);

    // One suggestion plugin per trigger, plus the unkeyed close-on-blur plugin.
    const keys = plugins
      .map((plugin: any) => plugin.key)
      .filter((key: string) => key?.startsWith("suggestion-"));
    expect(keys).toHaveLength(2);
    expect(new Set(keys).size).toBe(2);
    // ProseMirror suffixes its own counter, so assert the trigger is in there rather
    // than an exact match: a key of `suggestion-undefined$` would pass the count check
    // above purely on that counter.
    expect(keys.some((key: string) => key.startsWith("suggestion-@"))).toBe(
      true,
    );
    expect(keys.some((key: string) => key.startsWith("suggestion-#"))).toBe(
      true,
    );
  });

  it("builds nothing when no configuration declares a trigger", async () => {
    // AICAP's path: no inlineTrigger anywhere, so it must never enter inline mode.
    const extension = await createInlineTagSuggestionExtension(
      [{ extensionName: "w", tag: "w" } as any],
      vueRef(null),
    );
    expect(extension).toBeUndefined();
  });
});
