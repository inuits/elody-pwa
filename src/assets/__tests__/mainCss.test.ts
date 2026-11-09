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
    blocks(/body\.?(?![\w-])/).forEach((block) =>
      declarations(block).forEach((value, name) => bodyAliases.set(name, value)),
    );

    const missing = [...themeAliases].filter(
      ([name, value]) => bodyAliases.get(name) !== value,
    );
    expect(missing).toEqual([]);
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

  it("sets the toast title and text at the toast size", () => {
    const body = blocks(
      /\.vue-notification \.notification-title,\s*\.vue-notification \.notification-content/,
    ).join();
    expect(body).toMatch(/font-size:\s*inherit/);
  });
});
