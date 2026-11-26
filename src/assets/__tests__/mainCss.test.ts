import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const css = readFileSync(resolve(__dirname, "../main.css"), "utf8").replace(
  /\/\*[\s\S]*?\*\//g,
  "",
);

const blocks = (selector: RegExp): string[] =>
  [...css.matchAll(new RegExp(`${selector.source}\\s*\\{([^}]*)\\}`, "g"))].map(
    (match) => match[1],
  );

const declarations = (body: string): Map<string, string> =>
  new Map(
    [...body.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)].map((m) => [
      m[1],
      m[2].trim(),
    ]),
  );

describe("main.css client theming", () => {
  it("contains no per-client scopes", () => {
    expect(css).not.toMatch(/data-elody-client/);
  });

  it("re-declares every derived colour alias on body", () => {
    const themeAliases = new Map<string, string>();
    blocks(/@theme/).forEach((block) =>
      declarations(block).forEach((value, name) => {
        if (name.startsWith("--color-") && /var\(--color-/.test(value))
          themeAliases.set(name, value);
      }),
    );
    const bodyAliases = new Map<string, string>();
    blocks(/(?<!\.dark )body\.?(?![\w-])/).forEach((block) =>
      declarations(block).forEach((value, name) => bodyAliases.set(name, value)),
    );

    const missing = [...themeAliases].filter(
      ([name, value]) => bodyAliases.get(name) !== value,
    );
    expect(missing).toEqual([]);
  });

  // A client sets only --color-accent; every accent shade and the label/link
  // colour must follow it instead of staying platform blue
  const seededTokens = [
    "--color-accent-hover",
    "--color-accent-light",
    "--color-accent-light-strong",
    "--color-accent-wash",
    "--color-accent-tint",
    "--color-accent-dark",
    "--color-text-light",
    "--color-chip-relation-bg",
    "--color-surface-row-hover",
    "--color-surface-repeat-row",
    "--color-surface-group-form",
  ];

  it.each(seededTokens)("derives %s from --color-accent in light mode", (name) => {
    const themeValues = new Map<string, string>();
    blocks(/@theme/).forEach((block) =>
      declarations(block).forEach((value, token) => themeValues.set(token, value)),
    );
    expect(themeValues.get(name)).toMatch(/var\(--color-accent\)/);
  });

  it.each(seededTokens)("derives %s from --color-accent in dark mode", (name) => {
    const darkValues = declarations(blocks(/html\.dark,\s*html\.dark body/).join());
    expect(darkValues.get(name) ?? "").toMatch(/var\(--color-accent\)/);
  });
});

// @tailwindcss/forms resets the outline on `[type='text']:focus` (0,2,0),
// which beats a plain `input:focus-visible` (0,1,1) and hides the ring on
// every text, number and date input. Checked live in Chrome; here the
// selectors are pinned so the ring keeps outranking it.
describe("main.css focus ring", () => {
  it.each(["input", "textarea", "select"])(
    "gives %s the ring over the forms plugin's reset",
    (element) => {
      expect(css).toMatch(new RegExp(`${element}:focus-visible:focus-visible`));
    },
  );
});

// feedback.md: one toast, 12.5px text; the library's wrapper clipped the
// toast shadow into a grey box and its title/text ran at 20px/16px
describe("main.css toasts", () => {
  it("lets the toast shadow show past the library's wrapper", () => {
    expect(blocks(/\.vue-notification-wrapper/).join()).toMatch(/overflow:\s*visible/);
  });

  it("sets the toast size over the library's own 12px", () => {
    expect(blocks(/\.vue-notification/).join()).toMatch(
      /font-size:\s*var\(--text-table\)\s*!important/,
    );
  });

  it("sets the toast title and text at the toast size", () => {
    const body = blocks(
      /\.vue-notification \.notification-title,\s*\.vue-notification \.notification-content/,
    ).join();
    expect(body).toMatch(/font-size:\s*inherit/);
  });
});

describe("main.css units", () => {
  const pxByDesign =
    /radius|border|shadow|focus-ring|tracking|breakpoint|underline-offset|accent-width/;

  it("sizes type, spacing and layout tokens in rem", () => {
    const pxTokens = [...css.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)]
      .filter(
        ([, name, value]) =>
          /\d+(\.\d+)?px/.test(value) && !pxByDesign.test(name),
      )
      .map(([, name, value]) => `${name}: ${value.trim()}`)
      .filter((decl) => !/--multiselect-spacer-height/.test(decl));
    expect(pxTokens).toEqual([]);
  });

  it("sets the app base font size in rem", () => {
    expect(blocks(/body/).join()).toMatch(/font-size:\s*0\.875rem/);
  });
});

describe("main.css UI scale", () => {
  it("derives the root font size from --ui-scale", () => {
    expect(blocks(/html/).join()).toMatch(
      /font-size:\s*calc\(var\(--ui-scale\)\s*\*\s*100%\)/,
    );
  });

  it("sizes icons from their width and height attributes in rem", () => {
    const body = blocks(/\.unicon > svg,\s*\.custom-icon > svg/).join();
    expect(body).toMatch(
      /height:\s*calc\(attr\(height type\(<number>\),\s*24\)\s*\*\s*0\.0625rem\)/,
    );
    expect(body).toMatch(
      /width:\s*calc\(attr\(width type\(<number>\),\s*24\)\s*\*\s*0\.0625rem\)/,
    );
    expect(body).not.toMatch(/zoom/);
  });
});
