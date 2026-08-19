import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";
import { compileScript, compileTemplate, parse } from "vue/compiler-sfc";

/**
 * Template expressions are not type-checked in this repo (vue-tsc cannot run
 * against tsconfig.vitest.json), so a template that reads an identifier which
 * `<script setup>` never declared compiles fine and only fails in the browser with
 * "_ctx.X is undefined". This walks the compiled render function for exactly that.
 */
const unresolvedTemplateBindings = (relativePath: string): string[] => {
  const filename = resolve(__dirname, "..", relativePath);
  const source = readFileSync(filename, "utf8");
  const { descriptor } = parse(source, { filename });
  const script = compileScript(descriptor, { id: filename });

  const { code } = compileTemplate({
    source: descriptor.template?.content ?? "",
    filename,
    id: filename,
    compilerOptions: {
      bindingMetadata: script.bindings,
      prefixIdentifiers: true,
    },
  });

  // Everything a script-setup binding resolves to is emitted as $setup.x; whatever
  // is left on _ctx was not declared anywhere.
  return [
    ...new Set(
      [...code.matchAll(/_ctx\.([A-Za-z_$][\w$]*)/g)].map((m) => m[1]),
    ),
  ]
    .filter((name) => !name.startsWith("$"))
    .sort();
};

// Blocks lifted out of DynamicForm.vue leave its template's scope, so the ones it
// still drives through props have to be walked too.
const templates = [
  "DynamicForm.vue",
  "../bulk-operations/BulkEditRelationModeSelector.vue",
  "../bulk-operations/BulkEditClearFieldButton.vue",
  "../bulk-operations/BulkEditFieldScopeNote.vue",
];

describe("DynamicForm template", () => {
  it.each(templates)(
    "%s reads no identifier that the script does not declare",
    (template) => {
      expect(unresolvedTemplateBindings(template)).toEqual([]);
    },
  );
});
