/**
 * A tag in a rendered comment body must survive sanitizing, keeping its data-entity-id —
 * that attribute is the only thing that makes the tag clickable, so losing it silently
 * downgrades every @ and # to plain text.
 */
import { describe, expect, it } from "vitest";
import { sanitizeHtml } from "@/helpers";

const body =
  '<p>hi <elody-user data-entity-id="U-1" data-label="Ada">Ada</elody-user> there</p>';

describe("sanitizing a comment body", () => {
  it("keeps a tag element and its entity id when the tag name is allowed", () => {
    const clean = sanitizeHtml(body, ["elody-user"]);

    expect(clean).toContain("elody-user");
    expect(clean).toContain('data-entity-id="U-1"');
  });

  it("keeps data-entity-type, without which a # tag cannot be opened", () => {
    // A configuration that tags any entity records the type on the element, because the
    // element name no longer identifies it. Dropped here, every # tag becomes a dead end.
    const clean = sanitizeHtml(
      '<p><elody-entity data-entity-id="W-1" data-entity-type="work_word">Boek</elody-entity></p>',
      ["elody-entity"],
    );

    expect(clean).toContain('data-entity-type="work_word"');
  });

  it("still strips a tag element the configuration cannot produce", () => {
    const clean = sanitizeHtml(body, ["elody-work"]);

    expect(clean).not.toContain("elody-user");
    expect(clean).toContain("Ada");
  });
});
