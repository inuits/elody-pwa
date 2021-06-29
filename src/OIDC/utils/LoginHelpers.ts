import { OpenIdConnectConfiguration } from '../interfaces/OpenIdConnectConfiguration'
import { OpenIdConnectRepositoryInterface } from '../interfaces/OpenIdConnectRepositoryInterface'
import { OpenIdConnectRepository } from '../repositories/OpenIdConnectRepository'
import { OpenIdUrlHelpers } from './OpenIdUrlHelpers'
import { RedirectRouteStorageHelpers } from './RedirectRouteStorageHelpers'

export const postCode = (
  authCode: string,
  repository: OpenIdConnectRepositoryInterface,
  authorizedRedirectRoute: string
) => {
  return repository.postCode(authCode).then((result: any) => {
    let redirectRoute = authorizedRedirectRoute
    const storedRedirectRoute = RedirectRouteStorageHelpers.getRedirectRoute()
    if (storedRedirectRoute) {
      redirectRoute = storedRedirectRoute
    }
    return redirectRoute
  })
}

export const checkLoggedIn = (
  repository: OpenIdConnectRepositoryInterface
): Promise<boolean> => {
  return repository.getLoggedIn().then((result: any) => {
    if (result.status !== 401) {
      return true
    }
    return false
  })
}

export const login = (
  OIDCconfig: OpenIdConnectConfiguration,
  finalRedirectRoute?: string
) => {
  const redirectUrl = OpenIdUrlHelpers.buildInternalRedirectUrl(
    OIDCconfig.InternalRedirectUrl,
    !OIDCconfig.encodeRedirectUrl
  )
  // Build openIdConnect url

  const authEndpoint = OpenIdUrlHelpers.buildAuthEnpointWithReturnUrlEncoded(
    OIDCconfig.authEndpoint,
    OIDCconfig.encodeRedirectUrl
  )
  const baseOpenIdConnectUrl = `${OIDCconfig.baseUrl}/${authEndpoint}`

  const openIdParameters = {
    scope: OIDCconfig.scope ? OIDCconfig.scope : 'openid',
    client_id: OIDCconfig.clientId,
    response_type: 'code',
    redirect_uri: redirectUrl
  }

  const openIdConnectUrl =
    baseOpenIdConnectUrl +
    OpenIdUrlHelpers.buildOpenIdParameterString(
      openIdParameters,
      OIDCconfig.encodeRedirectUrl
    )

  // Save final redirect route in session storage so it can be used at the end of the openid flow
  if (finalRedirectRoute) {
    RedirectRouteStorageHelpers.setRedirectRoute(finalRedirectRoute)
  }
  window.location.href = openIdConnectUrl
}
