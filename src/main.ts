import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import './index.css'
import Unicon from 'vue-unicons'
import Config from './models/ConfigModel'
import { OpenIdConnectPlugin } from './OIDC/OpenIdConnectPlugin'

import {
  uniEye,
  uniFileDownload,
  uniSearchPlus,
  uniSearchMinus,
  uniDesktop,
  uniAngleLeft,
  uniAngleRight,
  uniBookOpen,
  uniUser
} from 'vue-unicons/dist/icons'

Unicon.add([
  uniEye,
  uniFileDownload,
  uniSearchPlus,
  uniSearchMinus,
  uniDesktop,
  uniAngleLeft,
  uniAngleRight,
  uniBookOpen,
  uniUser
])

const config = Config.deserialize(await fetch('../config.json').then(r => r.json()));
const OIDCplugin = await OpenIdConnectPlugin({
  router,
  configuration: {
    baseUrl: config.OIDCbaseUrl,
    serverBaseUrl: config.OIDCauthorizedRedirectRoute,
    tokenEndpoint: config.OIDCtokenEndpoint || 'token',
    authEndpoint: config.OIDCauthEndpoint || 'auth',
    logoutEndpoint: config.OIDClogoutEndpoint || 'logout',
    clientId: config.OIDCclientId,
    authorizedRedirectRoute: config.OIDCauthorizedRedirectRoute || '/',
    serverTokenEndpoint: config.OIDCserverTokenEndpoint || 'token/',
    serverRefreshEndpoint: config.OIDCserverRefreshEndpoint || 'refresh/',
    InternalRedirectUrl: '',
    apiCodeEndpoint: config.apiCodeEndpoint
  },
})

createApp(App)
  .use(Unicon)
  .use(OIDCplugin)
  .use(store)
  .use(router)
  .mount('#app')
