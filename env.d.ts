/// <reference types="vite/client" />

declare module "@intlify/vite-plugin-vue-i18n/messages" {
  import type { LocaleMessages } from "@intlify/core-base";
  import type { VueMessageType } from "vue-i18n";
  const messages: LocaleMessages<VueMessageType>;
  export default messages;
}
