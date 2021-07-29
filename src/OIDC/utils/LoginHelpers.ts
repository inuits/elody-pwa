import { OpenIdConnectConfiguration } from '../interfaces/OpenIdConnectConfiguration';
import { OpenIdConnectRepositoryInterface } from '../interfaces/OpenIdConnectRepositoryInterface';
import { OpenIdUrlHelpers } from './OpenIdUrlHelpers';
import { RedirectRouteStorageHelpers } from './RedirectRouteStorageHelpers';

export async function postCode(
  authCode: string,
  repository: OpenIdConnectRepositoryInterface,
  authorizedRedirectRoute: string,
) {
  await repository.postCode(authCode);
  const storedRedirectRoute = RedirectRouteStorageHelpers.getRedirectRoute();
  return storedRedirectRoute || authorizedRedirectRoute;
}

export async function checkLoggedIn(
  repository: OpenIdConnectRepositoryInterface,
): Promise<boolean> {
  const result = await repository.getLoggedIn();
  return result.status !== 401;
}

export function login(OIDCconfig: OpenIdConnectConfiguration, finalRedirectRoute?: string) {
  const redirectUrl = OpenIdUrlHelpers.buildInternalRedirectUrl(
    OIDCconfig.InternalRedirectUrl,
    !OIDCconfig.encodeRedirectUrl,
  );
  // Build openIdConnect url
  const authEndpoint = OpenIdUrlHelpers.buildAuthEnpointWithReturnUrlEncoded(
    OIDCconfig.authEndpoint,
    OIDCconfig.encodeRedirectUrl,
  );
  const openIdConnectUrl =
    `${OIDCconfig.baseUrl}/${authEndpoint}` +
    OpenIdUrlHelpers.buildOpenIdParameterString(
      {
        scope: OIDCconfig.scope ? OIDCconfig.scope : 'openid',
        client_id: OIDCconfig.clientId,
        response_type: 'code',
        redirect_uri: redirectUrl,
      },
      OIDCconfig.encodeRedirectUrl,
    );

  // Save final redirect route in session storage so it can be used at the end of the openid flow
  if (finalRedirectRoute) {
    RedirectRouteStorageHelpers.setRedirectRoute(finalRedirectRoute);
  }
  window.location.href = openIdConnectUrl;
}
