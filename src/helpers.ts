// import { GetEnumsByNameDocument } from './queries';
import { createI18n } from "vue-i18n";
// import type { LocaleMessages, VueMessageType } from "vue-i18n";

export const asString = (x: string | string[]) => (Array.isArray(x) ? x[0] : x);

/**
 * Load locale messages
 *
 * The loaded `JSON` locale messages is pre-compiled by `@intlify/vue-i18n-loader`, which is integrated into `vue-cli-plugin-i18n`.
 * See: https://github.com/intlify/vue-i18n-loader#rocket-i18n-resource-pre-compilation
 */
// ToDo vite migrations
// function loadLocaleMessages(): LocaleMessages<VueMessageType> {
//   //Set here with vite migrations
//   //@ts-ignore
//   const locales = require.context(
//     "./locales",
//     true,
//     /[A-Za-z0-9-_,\s]+\.json$/i
//   );
//   const messages: LocaleMessages<VueMessageType> = {};
//   locales.keys().forEach((key) => {
//     const matched = key.match(/([A-Za-z0-9-_]+)\./i);
//     if (matched && matched.length > 1) {
//       const locale = matched[1];
//       messages[locale] = locales(key).default;
//     }
//   });
//   return messages;
// }

// ToDo vite migrations
export default createI18n({
  legacy: false,
  //ToDo set back env vars from vite migrations
  locale: "nl",
  fallbackLocale: "nl",
  //@ts-ignore
  messages: {},
});
