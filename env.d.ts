/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Selects the [data-elody-client] design-system token scope. */
  readonly VITE_ELODY_CLIENT?: string;
}

declare module "@intlify/vite-plugin-vue-i18n/messages" {
  import type { LocaleMessages } from "@intlify/core-base";
  import type { VueMessageType } from "vue-i18n";
  const messages: LocaleMessages<VueMessageType>;
  export default messages;
}
