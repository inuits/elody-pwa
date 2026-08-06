/**
 * Guards the one thing that is easy to get wrong here: @tiptap/suggestion defaults to a
 * single shared PluginKey, so more than one trigger on the same editor makes ProseMirror
 * throw "Adding different instances of a keyed plugin (suggestion$)". vlacc ships two
 * triggers (`@` for users, `#` for works), so the default is never usable for us.
 */
import { describe, expect, it } from "vitest";
import { ref as vueRef } from "vue";
import { createInlineTagSuggestionExtension } from "../inlineTagSuggestion";

const configurationWithTrigger = (extensionName: string, character: string) =>
  ({
    extensionName,
    tag: extensionName,
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
