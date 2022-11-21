import { createI18n } from "vue-i18n";
import messages from "@intlify/vite-plugin-vue-i18n/messages";

export const langs: string[] = ["nl", "fr"];

export const mergeLanguageJsonFiles = (messages: any, langs: string[]): any => {
  const newMessages: any = {};
  langs.forEach((lang: string) => {
    for (var propt in messages) {
      if (propt.includes(lang)) {
        newMessages[lang] = { ...newMessages[lang], ...messages[propt] };
      }
    }
  });
  console.log(newMessages);
  return newMessages;
};

export const i18n = createI18n({
  globalInjection: true,
  locale: "nl",
  fallbackLocale: "nl",
  messages: mergeLanguageJsonFiles(messages, langs),
});

export const asString = (x: string | string[]) => (Array.isArray(x) ? x[0] : x);

export const stringIsUrl = (value: string): Boolean => {
  let isUrl: Boolean = false;
  if (value.includes("http://") || value.includes("https://")) {
    isUrl = true;
  }
  return isUrl;
};

export const getIdFromKey = (prefix: string = "entities", key: string) => {
  if (key.includes(prefix + "/")) {
    return key.replace(prefix + "/", "");
  } else {
    return key;
  }
};
