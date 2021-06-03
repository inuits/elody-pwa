import OpenIdConnectModule from './store/modules/OpenIdConnectModule'
import { openIdConnectRoutes } from './routes/OpenIdConnectRoutes'
import { OpenIdConnectRepository } from './repositories/OpenIdConnectRepository'
//import _Vue from 'vue'

export function OpenIdConnectPlugin<OpenIdConnectPluginOptions> (app: any, options: any): void {
  if (!options.store) throw new Error('Inuits-vuejs-oidc needs a store')

  if (!options.router) throw new Error('Inuits-vuejs-oidc needs a router')

  if (!options.configuration) throw new Error('Inuits-vuejs-oidc needs configuration')

  options.store.registerModule('openid', OpenIdConnectModule)
  options.store.dispatch('initializeConfig', options.configuration)
  // options.store.dispatch('getLoggedIn')

  openIdConnectRoutes.forEach(route => {
    options.router.addRoute(route)
  })

  const repo = new OpenIdConnectRepository(options.configuration)

  // Add some auth guards to routes with specific meta tags
  options.router.beforeEach(async (to: any, from: any, next: any) => {
    if (to.matched.some((record: any) => record.meta.requiresOpenIdAuth)) {
      let isLoggedIn = options.store.getters.isLoggedIn
      if(isLoggedIn === undefined){
        const result = await repo.getLoggedIn()
        isLoggedIn = false
        if(result.status !== 401){
          isLoggedIn = true //JSON.parse(result)
        }
        // await options.store.dispatch('getLoggedIn')
        //isLoggedIn = options.store.getters.isLoggedIn
        console.log(isLoggedIn)
      }
      if(!isLoggedIn){
        if (options.configuration.unauthorizedRedirectRoute) {
          next({
            path: '/login',
            query: { redirect: to.fullPath }
          })
        } else {
          options.store.dispatch('login', to.fullPath)
          next()
        }
      } else {
        next()
      }
    } else {
      next()
    }
  })
  
}


export { OpenIdConnectPluginOptions } from './interfaces/OpenIdConnectPluginOptions'
export { OpenIdConnectConfiguration } from './interfaces/OpenIdConnectConfiguration'
// export { OpenIdConnectInterceptors } from './interceptors/OpenIdConnectInterceptors'
