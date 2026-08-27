// Picking the same entity twice.
//
// The picker greys out anything the parent is already related to, which is
// right for most relations -- the same author twice is a slip. A pipeline step
// is not a relation of that kind: it is a *use* of a component, and one
// component can be used twice. The RDF-Connect tutorial's pipeline runs two
// `LogProcessorJs` (one on the report channel, one on the output channel), and
// the toolchain's own reference definition has two of two different components.
//
// So the behaviour is a per-operation choice, defaulting to what it has always
// been.

import { describe, it, expect, beforeEach } from "vitest";
import useEntityPickerModal from "../useEntityPickerModal";

describe("useEntityPickerModal duplicates", () => {
  const { setAllowDuplicateRelations, getAllowDuplicateRelations } =
    useEntityPickerModal();

  beforeEach(() => setAllowDuplicateRelations(false));

  it("does not allow them by default", () => {
    expect(getAllowDuplicateRelations()).toBe(false);
  });

  it("allows them when an operation asks for it", () => {
    setAllowDuplicateRelations(true);
    expect(getAllowDuplicateRelations()).toBe(true);
  });

  it("is shared state, so the picker sees what the operation set", () => {
    // the operation and the picker reach it through separate calls to the
    // composable; this is what makes the flag arrive at the picker at all
    setAllowDuplicateRelations(true);
    const { getAllowDuplicateRelations: fromElsewhere } = useEntityPickerModal();
    expect(fromElsewhere()).toBe(true);
  });

  it("goes back off for the next operation", () => {
    setAllowDuplicateRelations(true);
    setAllowDuplicateRelations(false);
    expect(getAllowDuplicateRelations()).toBe(false);
  });
});
