import { assert, describe, it } from 'vitest';
import useFormHelper from "@/composables/useFormHelpers";
import { dataSetBuildInitialValues } from './fakeData';

describe('#useFormHelper', () => {
    it.each(dataSetBuildInitialValues)('Should map all values depending on the given form', ({ form, dataInput, expectedResult, entityTitle }) => {
        //ARRANGE
        const { buildInitialValues } = useFormHelper(form, entityTitle);
        //ACT
        const result = buildInitialValues(dataInput);
        //ASSERT
        assert.deepEqual(expectedResult, result);
    });
});
