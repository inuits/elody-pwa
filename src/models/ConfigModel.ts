export default class Config {
  constructor(
    public OIDCbaseUrl: string,
    public OIDCtokenEndpoint: string,
    public OIDCauthEndpoint: string,
    public OIDClogoutEndpoint: string,
    public OIDCclientId: string,
    public OIDCauthorizedRedirectRoute: string,
    public OIDCserverTokenEndpoint: string,
    public OIDCserverRefreshEndpoint: string,
    public apiCodeEndpoint: string
  ) {}

  public static deserialize(input: any): Config {
    return new Config(
      input.oidcBaseUrl,
      input.oidcTokenEndpoint,
      input.oidcAuthEndpoint,
      input.oidcLogoutEndpoint,
      input.oidcClientId,
      input.oidcAuthorizedRedirectRoute,
      input.oidcServerTokenEndpoint,
      input.oidcServerRefreshEndpoint,
      input.apiCodeEndpoint
    )
  }
}
