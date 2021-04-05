import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import './index.css'
import Unicon from 'vue-unicons'

import {
  uniEye,
  uniFileDownload,
  uniSearchPlus,
  uniSearchMinus,
  uniDesktop,
  uniAngleLeft,
  uniAngleRight,
  uniBookOpen
} from 'vue-unicons/dist/icons'

Unicon.add([
  uniEye,
  uniFileDownload,
  uniSearchPlus,
  uniSearchMinus,
  uniDesktop,
  uniAngleLeft,
  uniAngleRight,
  uniBookOpen
])

createApp(App)
  .use(store)
  .use(router)
  .use(Unicon)
  .mount('#app')
