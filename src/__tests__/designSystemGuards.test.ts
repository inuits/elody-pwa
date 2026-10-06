import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

// Template strings are not type-checked by vue-tsc, so a retired variant can
// slip in through a merge and only fail at runtime. These guards catch it.
const root = resolve(__dirname, "..");
const sourceFiles = (readdirSync(root, { recursive: true }) as string[])
  .filter((file) => /\.(vue|ts)$/.test(file))
  .filter((file) => !/(__tests__|\/tests\/|\.test\.ts$|generated-types|__mocks__)/.test(file));

const offenders = (pattern: RegExp): string[] =>
  sourceFiles.flatMap((file) => {
    const lines = readFileSync(join(root, file), "utf8").split("\n");
    return lines
      .map((line, index) => (pattern.test(line) ? `${file}:${index + 1}` : ""))
      .filter(Boolean);
  });

describe("design-system guards", () => {
  it("uses no retired button variants", () => {
    expect(
      offenders(
        /(button-style|buttonStyle|ButtonStyle)\W+["'`](default|accentNormal|accentAccent|redDefault)["'`]/,
      ),
    ).toEqual([]);
  });

  it("uses no retired button sizes", () => {
    expect(
      offenders(/(button-size|buttonSize|ButtonSize)\W+["'`](normal|small|verySmall)["'`]/),
    ).toEqual([]);
  });

  it("uses no retired checkbox input style", () => {
    expect(offenders(/input-style="accentNormal"/)).toEqual([]);
  });
});
