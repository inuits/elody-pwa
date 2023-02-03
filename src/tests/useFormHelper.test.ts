import { assert, describe, it } from "vitest";
import useFormHelper from "@/composables/useFormHelpers";
import { dataSet_BuildInitialValues } from "./fakeData";

describe("#useFormHelper", () => {
  it.each(dataSet_BuildInitialValues)(
    "Should map all values depending on the given form",
    ({ form, dataInput, expectedResult, entityTitle }) => {
      //ARRANGE
      const { buildInitialValues } = useFormHelper(form, entityTitle);
      //ACT
      const result = buildInitialValues(dataInput);
      //ASSERT
      assert.deepEqual(expectedResult, result);
    }
  );
});
