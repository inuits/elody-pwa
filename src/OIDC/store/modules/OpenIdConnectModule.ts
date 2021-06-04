import { OpenIdConnectConfiguration } from '../../interfaces/OpenIdConnectConfiguration'
import { OpenIdConnectUserInformation } from '../../interfaces/OpenIdConnectUserInformation'
import { OpenIdConnectRepository } from '../../repositories/OpenIdConnectRepository'
import { OpenIdUrlHelpers } from '../../utils/OpenIdUrlHelpers'
import { RedirectRouteStorageHelpers } from '../../utils/RedirectRouteStorageHelpers'

const configuration: OpenIdConnectConfiguration = {
  baseUrl: '',
  tokenEndpoint: '',
  authEndpoint: '',
  logoutEndpoint: '',
  clientId: '',
  authorizedRedirectRoute: '',
  InternalRedirectUrl: '',
  encodeRedirectUrl: false
}

export default {
  state: () => ({
    openid: {
      loggedIn: undefined,
      configuration: configuration,
      repository: new OpenIdConnectRepository(configuration)
    }
  }),
  mutations: {
    INITIALIZE_CONFIG (state: any, configuration: OpenIdConnectConfiguration) {
      // Make sure that if serverBaseUrl is defined, we also have it's related endpoints
      if (configuration.serverBaseUrl) {
        if (!configuration.serverTokenEndpoint || !configuration.serverRefreshEndpoint) {
          throw new Error('Configuration contains a serverBaseUrl but not all of the required server endpoints')
        }
      }
      if (!configuration.InternalRedirectUrl) {
        configuration.InternalRedirectUrl = 'openid/redirect'
      }
      state.openid.configuration = configuration
      state.openid.repository = new OpenIdConnectRepository(configuration)
    },
    SET_LOGGED_IN (state: any, isLoggedIn: boolean) {
      state.openid.isLoggedIn = isLoggedIn
    }
  },
  actions: {
    initializeConfig ({ commit }: any, data: any) {
      commit('INITIALIZE_CONFIG', data)
    },
    login ({ commit, state }: any, finalRedirectRoute?: string) {

      const redirectUrl = OpenIdUrlHelpers.buildInternalRedirectUrl(state.openid.configuration.InternalRedirectUrl, !state.openid.configuration.encodeRedirectUrl)
      // Build openIdConnect url

      const authEndpoint = OpenIdUrlHelpers.buildAuthEnpointWithReturnUrlEncoded(state.openid.configuration.authEndpoint, state.openid.configuration.encodeRedirectUrl)
      const baseOpenIdConnectUrl = `${state.openid.configuration.baseUrl}/${authEndpoint}`

      const openIdParameters = {
        scope: state.openid.configuration.scope ? state.openid.configuration.scope : 'openid',
        client_id: state.openid.configuration.clientId,
        response_type: 'code',
        redirect_uri: redirectUrl
      }

      const openIdConnectUrl = baseOpenIdConnectUrl + OpenIdUrlHelpers.buildOpenIdParameterString(openIdParameters, state.openid.configuration.encodeRedirectUrl)

      // Save final redirect route in session storage so it can be used at the end of the openid flow
      if (finalRedirectRoute) {
        RedirectRouteStorageHelpers.setRedirectRoute(finalRedirectRoute)
      }
      window.location.href = openIdConnectUrl
    },
    logout ({ commit, state }: any, data: any) {
      // Overwrite unauthorized redirect route if given
      let redirectRoute = 'openid/logout'
      if (state.openid.configuration.unauthorizedRedirectRoute) {
        redirectRoute = state.openid.configuration.unauthorizedRedirectRoute
      }

      const redirectUrl = OpenIdUrlHelpers.buildInternalRedirectUrl(redirectRoute)

      // Build openIdConnect url
      const baseOpenIdConnectUrl = `${state.openid.configuration.baseUrl}/${state.openid.configuration.logoutEndpoint}`
      const openIdParameters = {
        scope: state.openid.configuration.scope ? state.openid.configuration.scope : 'openid',
        client_id: state.openid.configuration.clientId,
        redirect_uri: redirectUrl
      }

      commit('clearTokens')
      const openIdConnectUrl = baseOpenIdConnectUrl + '?' + OpenIdUrlHelpers.buildOpenIdParameterString(openIdParameters, state.openid.configuration.encodeRedirectUrl)
      window.location.href = openIdConnectUrl
    },
    postCode ({ dispatch, state }: any, authCode: string) {
      return state.openid.repository.postCode(authCode).then((result: any) => {
        let redirectRoute = state.openid.configuration.authorizedRedirectRoute
        state.openid.loggedIn = true
        // Overwrite redirect route if available in session storage
        const storedRedirectRoute = RedirectRouteStorageHelpers.getRedirectRoute()
        if (storedRedirectRoute) {
          redirectRoute = storedRedirectRoute
        }
        
        return redirectRoute
      })
    },
    async getLoggedIn ({ commit, state }: any) { 
      const result = await state.openid.repository.getLoggedIn()
      let loggedIn = false
      if(result.status !== 401){
        loggedIn = true //JSON.parse(result)
      }
      commit('SET_LOGGED_IN', loggedIn)
    }
  },
  getters: {
    isLoggedIn (state: any): boolean {
      return state.openid.loggedIn
    }
  }
}
