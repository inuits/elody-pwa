import { App, ComputedRef, reactive, Plugin, computed } from 'vue'

import { OpenIdConnectRepository } from './repositories/OpenIdConnectRepository'
import { OpenIdConnectConfiguration } from './interfaces/OpenIdConnectConfiguration'
import { RedirectRouteStorageHelpers } from './utils/RedirectRouteStorageHelpers'
import { OpenIdUrlHelpers } from './utils/OpenIdUrlHelpers'
import { postCode, checkLoggedIn, login } from './utils/LoginHelpers'
import { OpenIdConnectRepositoryInterface } from './interfaces/OpenIdConnectRepositoryInterface'

export interface OIDCplugin {
  isAuthenticated: ComputedRef<boolean>
  loading: ComputedRef<boolean>
  login: (openIdconnectconfiguration: OpenIdConnectConfiguration, finalRedirectRoute?: string) => void
}

export interface OIDCstate {
  OIDCconfig: OpenIdConnectConfiguration
  isLoggedIn: boolean
  loading: boolean
  repository: OpenIdConnectRepositoryInterface
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

export const OIDCplugin: OIDCplugin = {
  isAuthenticated: computed(() => state.isLoggedIn),
  loading: computed(() => state.loading),
  login: login
}

export const getConfig = (): OpenIdConnectConfiguration => {
  return state.OIDCconfig
}

export async function OpenIdConnectPlugin<OpenIdConnectPluginOptions>(
  options: any
): Promise<Plugin> {
  if (!options.router) throw new Error('Inuits-vuejs-oidc needs a router')
  if (!options.configuration) throw new Error('Inuits-vuejs-oidc needs configuration')

  state.OIDCconfig = options.configuration
  state.repository = new OpenIdConnectRepository(state.OIDCconfig)

  try {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const accessCode = urlParams.get('code')

    if (accessCode) {
      state.loading = true
      postCode(accessCode, state.repository, state.OIDCconfig.authorizedRedirectRoute).then((redirectPath: any) => {
        state.loading = false
        state.isLoggedIn = true
        options.router.push({ path: redirectPath })
      })
    }
  } catch (e) {
    state.error = e
  } finally {
    if(!state.isLoggedIn){
      state.isLoggedIn = await checkLoggedIn(state.repository)
    }
  }

  return {
    install: (app: App) => {
      app.provide('Auth', OIDCplugin)
    }
  }
}
