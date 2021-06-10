import { NavigationGuardWithThis } from 'vue-router'
import { watchEffect } from 'vue'
import { getConfig, OIDCplugin } from './OpenIdConnectPlugin'

export const routeGuard: NavigationGuardWithThis<undefined> = (
    to: any,
    from: any,
    next: any
  ) => {
    const { isAuthenticated, loading, login } = OIDCplugin
  
    const verify = async () => {
      // If the user is authenticated, continue with the route
      if (isAuthenticated.value) {
        return next()
      }
  
      // Otherwise, log in
      await login(getConfig())
    }
  
    // If loading has already finished, check our auth state using `fn()`
    if (!loading.value) {
      return verify()
    }
  
    // Watch for the loading property to change before we check isAuthenticated
    watchEffect(() => {
      if (!loading.value) {
        return verify()
      }
    })
  }