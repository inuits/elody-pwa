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



fetch("../config.json").then( resp => resp.json() ).then((configJson: any) => {
    let config = Config.deserialize(configJson)
    let OIDCconfig = {
      baseUrl: config.OIDCbaseUrl,
      serverBaseUrl: config.OIDCauthorizedRedirectRoute,
      tokenEndpoint: config.OIDCserverTokenEndpoint
        ? config.OIDCserverTokenEndpoint
        : 'token',
      authEndpoint: config.OIDCauthEndpoint
        ? config.OIDCauthEndpoint
        : 'auth',
      logoutEndpoint: config.OIDClogoutEndpoint
        ? config.OIDClogoutEndpoint
        : 'logout',
      clientId: config.OIDCclientId,
      authorizedRedirectRoute: '/',
      serverTokenEndpoint: 'token/',
      serverRefreshEndpoint: 'refresh/',
      InternalRedirectUrl: ''
    }
    
    createApp(App)
    .use(Unicon)
    .use(OpenIdConnectPlugin, {
      store: store,
      router: router,
      configuration: OIDCconfig
    })
    .use(store)
    .use(router)
    .mount('#app')
})




