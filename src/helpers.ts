import { useQuery } from '@vue/apollo-composable';
import { GetEnumsByNameDocument } from './queries';
import { createI18n, LocaleMessages, VueMessageType } from 'vue-i18n';

export const getFromObjectArrayByKey = <T>(
  array: T[],
  key: string,
  value: number | string,
): T[] => {
  const filter = array.filter((obj: T) => {
    if (typeof obj === 'object' && hasOwnProperty(obj, key)) {
      return obj[key] === value;
    }
  });

  return filter;
};

export const hasOwnProperty = <X extends {}, Y extends PropertyKey>(
  obj: X,
  prop: Y,
): obj is X & Record<Y, unknown> => {
  return obj.hasOwnProperty(prop);
};

export const asString = (x: string | string[]) => (Array.isArray(x) ? x[0] : x);

export const getEnumValuesOf = (enumName: string) => {
  const { result } = useQuery(GetEnumsByNameDocument, { enumName: enumName });
  return result;
};

/**
 * Load locale messages
 *
 * The loaded `JSON` locale messages is pre-compiled by `@intlify/vue-i18n-loader`, which is integrated into `vue-cli-plugin-i18n`.
 * See: https://github.com/intlify/vue-i18n-loader#rocket-i18n-resource-pre-compilation
 */
function loadLocaleMessages(): LocaleMessages<VueMessageType> {
  const locales = require.context('./locales', true, /[A-Za-z0-9-_,\s]+\.json$/i);
  const messages: LocaleMessages<VueMessageType> = {};
  locales.keys().forEach((key) => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i);
    if (matched && matched.length > 1) {
      const locale = matched[1];
      messages[locale] = locales(key).default;
    }
  });
  return messages;
}

export const i18n = createI18n({
  legacy: false,
  locale: process.env.VUE_APP_I18N_LOCALE || 'nl',
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'nl',
  messages: loadLocaleMessages(),
});
