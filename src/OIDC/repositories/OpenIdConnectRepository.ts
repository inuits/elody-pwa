import { OpenIdUrlHelpers } from '../utils/OpenIdUrlHelpers'
import { OpenIdConnectConfiguration } from '../interfaces/OpenIdConnectConfiguration'

export class OpenIdConnectRepository {
  private configuration: OpenIdConnectConfiguration

  constructor(configuration: OpenIdConnectConfiguration) {
    this.configuration = configuration
  }

  postCode(authCode: string): Promise<any> {
    const redirectUrl = OpenIdUrlHelpers.buildInternalRedirectUrl(
      this.configuration.InternalRedirectUrl,
      false
    )
    const serverTokenUrl = `${this.configuration.apiCodeEndpoint}`

    const body = {
      authCode: authCode,
      realm: this.configuration.baseUrl,
      clientId: this.configuration.clientId,
      tokenEndpoint: this.configuration.tokenEndpoint,
      redirectUri: redirectUrl
    }

    return fetch(serverTokenUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
  }

  getLoggedIn(): Promise<any> {
    return fetch('/api/me', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
  }
}
