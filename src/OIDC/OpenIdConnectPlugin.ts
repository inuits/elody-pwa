
import { App, reactive, Plugin, computed, watchEffect } from 'vue'
import { useRouter, useRoute, NavigationGuardWithThis } from 'vue-router'
import OpenIdConnectModule from './store/modules/OpenIdConnectModule'
import { openIdConnectRoutes } from './routes/OpenIdConnectRoutes'
import { OpenIdConnectRepository } from './repositories/OpenIdConnectRepository'
import { OpenIdConnectConfiguration } from './interfaces/OpenIdConnectConfiguration'
import { RedirectRouteStorageHelpers } from './utils/RedirectRouteStorageHelpers'
import { OpenIdUrlHelpers } from './utils/OpenIdUrlHelpers'
import { ComputedRef } from 'vue'


export interface OIDCplugin {
  isAuthenticated: ComputedRef<boolean>
  loading: ComputedRef<boolean>
  login: (finalRedirectRoute?: string) => void
}

export interface OIDCstate {
  OIDCconfig: OpenIdConnectConfiguration
  isLoggedIn: boolean,
  loading: boolean,
  repository: OpenIdConnectRepository,
  error: any
}

const defaultConfiguration: OpenIdConnectConfiguration = {
  baseUrl: '',
  tokenEndpoint: '',
  authEndpoint: '',
  logoutEndpoint: '',
  clientId: '',
  authorizedRedirectRoute: '',
  InternalRedirectUrl: '',
  encodeRedirectUrl: false
}

const state = reactive<OIDCstate>({
  OIDCconfig: defaultConfiguration,
  isLoggedIn: false,
  loading: false,
  repository: new OpenIdConnectRepository(defaultConfiguration),
  error: undefined
})


const postCode = (authCode: string) => {
  return state.repository.postCode(authCode).then((result: any) => {
    let redirectRoute = state.OIDCconfig.authorizedRedirectRoute
    const storedRedirectRoute = RedirectRouteStorageHelpers.getRedirectRoute()
    if (storedRedirectRoute) {
      redirectRoute = storedRedirectRoute
    }
    return redirectRoute
  })
}

const checkLoggedIn = (): Promise<boolean> => {
  return state.repository.getLoggedIn().then((result: any) => {
    if(result.status !== 401){
      return true
    }
    return false
  })
}

const login = (finalRedirectRoute?: string) => {

  const redirectUrl = OpenIdUrlHelpers.buildInternalRedirectUrl(state.OIDCconfig.InternalRedirectUrl, !state.OIDCconfig.encodeRedirectUrl)
  // Build openIdConnect url

  const authEndpoint = OpenIdUrlHelpers.buildAuthEnpointWithReturnUrlEncoded(state.OIDCconfig.authEndpoint, state.OIDCconfig.encodeRedirectUrl)
  const baseOpenIdConnectUrl = `${state.OIDCconfig.baseUrl}/${authEndpoint}`

  const openIdParameters = {
    scope: state.OIDCconfig.scope ? state.OIDCconfig.scope : 'openid',
    client_id: state.OIDCconfig.clientId,
    response_type: 'code',
    redirect_uri: redirectUrl
  }

  const openIdConnectUrl = baseOpenIdConnectUrl + OpenIdUrlHelpers.buildOpenIdParameterString(openIdParameters, state.OIDCconfig.encodeRedirectUrl)

  // Save final redirect route in session storage so it can be used at the end of the openid flow
  if (finalRedirectRoute) {
    RedirectRouteStorageHelpers.setRedirectRoute(finalRedirectRoute)
  }
  window.location.href = openIdConnectUrl
}

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
    await login()
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

const OIDCplugin: OIDCplugin = {
  isAuthenticated: computed(() => state.isLoggedIn),
  loading: computed(() => state.loading),
  login: login
}

export async function OpenIdConnectPlugin<OpenIdConnectPluginOptions> (options: any): Promise<Plugin> {
  //if (!options.router) throw new Error('Inuits-vuejs-oidc needs a router')
  if (!options.configuration) throw new Error('Inuits-vuejs-oidc needs configuration')

  const route = useRoute()
  const router = useRouter()
  state.OIDCconfig = options.configuration
  state.repository = new OpenIdConnectRepository(state.OIDCconfig)

  try {
    const accessCode = route.query.code?.toString()
    console.log("here")
    if(accessCode) {
      state.loading = true
      postCode(accessCode).then((redirectPath: any) => {
        state.loading = false
        router.push({ path: redirectPath })
      })
    }
  } catch(e) {
    state.error = e
  } finally {
    state.isLoggedIn = await checkLoggedIn()
    console.log(state.isLoggedIn)
  }

  return {
    install: (app: App) => {
      app.provide('Auth', OIDCplugin)
    }
  }
}
