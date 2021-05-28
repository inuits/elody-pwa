import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import './index.css'
import Unicon from 'vue-unicons'
// import VueSession from 'vue-session'
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



fetch("../config.json").then( resp => resp.json() ).then((configJson: any) => {
    let config = Config.deserialize(configJson)
    let OIDCconfig = {
      baseUrl: config.OIDCbaseUrl,
      serverBaseUrl: config.OIDCauthorizedRedirectRoute,
      tokenEndpoint: config.OIDCtokenEndpoint
        ? config.OIDCtokenEndpoint
        : 'token',
      authEndpoint: config.OIDCauthEndpoint
        ? config.OIDCauthEndpoint
        : 'auth',
      logoutEndpoint: config.OIDClogoutEndpoint
        ? config.OIDClogoutEndpoint
        : 'logout',
      clientId: config.OIDCclientId,
      authorizedRedirectRoute: config.OIDCauthorizedRedirectRoute
        ? config.OIDCauthorizedRedirectRoute
        : '/',
      serverTokenEndpoint: config.OIDCserverTokenEndpoint
        ? config.OIDCserverTokenEndpoint
        : 'token/',
      serverRefreshEndpoint: config.OIDCserverRefreshEndpoint
        ? config.OIDCserverRefreshEndpoint
        : 'refresh/',
      InternalRedirectUrl: '',
      apiCodeEndpoint: config.apiCodeEndpoint
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
    // .use(VueSession)
    .mount('#app')
})




