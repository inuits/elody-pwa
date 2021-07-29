export class OpenIdUrlHelpers {
  public static buildInternalRedirectUrl(endpoint?: string, encoded = true): string {
    let port = '';
    if (location.port) {
      port = ':' + location.port;
    }
    const redirectBaseUrl = location.protocol + '//' + location.hostname + port;

    if (encoded) {
      return encodeURIComponent(redirectBaseUrl + '/' + endpoint);
    } else {
      return redirectBaseUrl + '/' + endpoint;
    }
  }

  public static buildOpenIdParameterString(
    parameters: object,
    encodeRedirectUrl: boolean = false,
  ): string {
    const parameterArray = [];
    for (const [key, param] of Object.entries(parameters)) {
      if (param) {
        parameterArray.push(key + '=' + param);
      }
    }
    let openIdParameterString = '?' + parameterArray.join('&');
    if (encodeRedirectUrl) {
      openIdParameterString = encodeURIComponent(openIdParameterString);
    }
    return openIdParameterString;
  }

  public static buildFormUrlEncoded(obj: object): string {
    const bodyArray = [];
    for (const [key, value] of Object.entries(obj)) {
      const encoded = key !== 'redirect_uri' ? encodeURIComponent(value) : value;
      if (encoded) {
        bodyArray.push(`${key}=${encoded}`);
      }
    }
    return bodyArray.join('&');
  }

  public static buildAuthEnpointWithReturnUrlEncoded(
    authEnpoint: string,
    encodeRedirectUrl: boolean = false,
  ): string {
    let authEnpointWithReturnUrlEncoded = authEnpoint;
    if (encodeRedirectUrl) {
      const returnUrl = authEnpoint.split('ReturnUrl=');
      authEnpointWithReturnUrlEncoded =
        returnUrl[0] + 'ReturnUrl=' + encodeURIComponent(returnUrl[1]);
    }
    return authEnpointWithReturnUrlEncoded;
  }
}
