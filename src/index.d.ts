declare module 'vue-unicons'
declare module 'vue-unicons/dist/icons'
declare module '/app/tailwind.config.js'

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
