import { createApp } from "vue"
import App from "./App.vue"
import "./registerServiceWorker"
import router from "./router"
import store from "./store"
import "./index.css"
//@ts-ignore
import Unicon from "vue-unicons"
//@ts-ignore
import { uniEye, uniFileDownload } from "vue-unicons/dist/icons"

export enum IncludedIcons {
  Eye = "eye",
  Download = "file-download",
}

Unicon.add([uniEye, uniFileDownload])

createApp(App)
  .use(store)
  .use(router)
  .use(Unicon)
  .mount("#app")
