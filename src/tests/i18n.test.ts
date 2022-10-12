import { assert, describe, it } from 'vitest';
import { mergeLanguageJsonFiles } from "@/helpers";
import { dataSet_I18n } from './fakeData';

describe('#i18nHelper', () => {
    it.each(dataSet_I18n)('Should map all values depending on the given form', ({ langs, messages, expectedResult }) => {
        //ACT
        const result = mergeLanguageJsonFiles(messages, langs);
        //ASSERT
        assert.deepEqual(expectedResult, result);
    });
});
