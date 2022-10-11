import { assert, describe, it } from 'vitest';
import useFormHelper from "@/composables/useFormHelpers";
import { dataSetBuildInitialValues } from './fakeData';

describe('#useFormHelper', () => {
    it.each(dataSetBuildInitialValues)('Should map all values depending on the given form', ({ form, dataInput, expectedResult }) => {
        //ARRANGE
        const { buildInitialValues } = useFormHelper(form, 'ricardo-frame-500');
        //ACT
        const result = buildInitialValues(dataInput);
        //ASSERT
        assert.deepEqual(expectedResult, result);
    });
});
