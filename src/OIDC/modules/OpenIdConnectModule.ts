import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import { OpenIdConnectConfiguration } from '../interfaces/OpenIdConnectConfiguration'
import { OpenIdUrlHelpers } from '../utils/OpenIdUrlHelpers'
import { RedirectRouteStorageHelpers } from '../utils/RedirectRouteStorageHelpers'
import { OpenIdConnectRepository } from '../repositories/OpenIdConnectRepository'

@Module({ namespaced: true, name: 'openid' })
export class OpenIdConnectModule extends VuexModule {
  // Data
  configuration: OpenIdConnectConfiguration = {
    baseUrl: '',
    tokenEndpoint: '',
    authEndpoint: '',
    logoutEndpoint: '',
    clientId: '',
    authorizedRedirectRoute: '',
    InternalRedirectUrl: 'openid/redirect',
    encodeRedirectUrl: false
  }

  repository: OpenIdConnectRepository = new OpenIdConnectRepository(this.configuration)

  @Mutation
  initializeConfig (configuration: OpenIdConnectConfiguration) {
    console.log('initializeConfig: ', configuration)
    // Make sure that if serverBaseUrl is defined, we also have it's related endpoints
    if (configuration.serverBaseUrl) {
      if (!configuration.serverTokenEndpoint || !configuration.serverRefreshEndpoint) {
        throw new Error('Configuration contains a serverBaseUrl but not all of the required server endpoints')
      }
    }
    if (!configuration.InternalRedirectUrl) {
      configuration.InternalRedirectUrl = 'openid/redirect'
    }
    this.configuration = configuration
    this.repository = new OpenIdConnectRepository(configuration)
  }


  // Actions
  @Action({})
  login (finalRedirectRoute?: string) {
    console.log('login')

    console.log(this.configuration.InternalRedirectUrl)
    const redirectUrl = OpenIdUrlHelpers.buildInternalRedirectUrl(this.configuration.InternalRedirectUrl, !this.configuration.encodeRedirectUrl)
    // Build openIdConnect url
    const authEndpoint = OpenIdUrlHelpers.buildAuthEnpointWithReturnUrlEncoded(this.configuration.authEndpoint, this.configuration.encodeRedirectUrl)
    const baseOpenIdConnectUrl = `${this.configuration.baseUrl}/${authEndpoint}`
    const openIdParameters = {
      scope: this.configuration.scope ? this.configuration.scope : 'openid',
      client_id: this.configuration.clientId,
      response_type: 'code',
      redirect_uri: redirectUrl
    }
    const openIdConnectUrl = baseOpenIdConnectUrl + OpenIdUrlHelpers.buildOpenIdParameterString(openIdParameters, this.configuration.encodeRedirectUrl)

    // Save final redirect route in session storage so it can be used at the end of the openid flow
    if (finalRedirectRoute) {
      RedirectRouteStorageHelpers.setRedirectRoute(finalRedirectRoute)
    }
    window.location.href = openIdConnectUrl
  }

  @Action({})
  logout () {
    console.log('logout')
    // Overwrite unauthorized redirect route if given
    let redirectRoute = 'openid/logout'
    if (this.configuration.unauthorizedRedirectRoute) {
      redirectRoute = this.configuration.unauthorizedRedirectRoute
    }

    const redirectUrl = OpenIdUrlHelpers.buildInternalRedirectUrl(redirectRoute)

    // Build openIdConnect url
    const baseOpenIdConnectUrl = `${this.configuration.baseUrl}/${this.configuration.logoutEndpoint}`
    const openIdParameters = {
      scope: this.configuration.scope ? this.configuration.scope : 'openid',
      client_id: this.configuration.clientId,
      redirect_uri: redirectUrl
    }

    const openIdConnectUrl = baseOpenIdConnectUrl + '?' + OpenIdUrlHelpers.buildOpenIdParameterString(openIdParameters, this.configuration.encodeRedirectUrl)
    window.location.href = openIdConnectUrl
  }

  // Getters
  get isLoggedIn (): boolean {
    return false
  }
}
