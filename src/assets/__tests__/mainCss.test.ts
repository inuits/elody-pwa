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

describe("main.css menu colour", () => {
  it("colours menu items like links by default, so a client theme reaches them", () => {
    const theme = new Map<string, string>();
    blocks(/@theme/).forEach((block) =>
      declarations(block).forEach((value, name) => theme.set(name, value)),
    );
    expect(theme.get("--color-nav-item")).toBe("var(--color-text-link)");
    expect(theme.get("--color-nav-item-hover")).toBe(
      "var(--color-text-link-hover)",
    );
  });
});
