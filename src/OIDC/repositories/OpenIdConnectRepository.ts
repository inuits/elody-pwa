import { OpenIdUrlHelpers } from '../utils/OpenIdUrlHelpers'
import { OpenIdConnectConfiguration } from '../interfaces/OpenIdConnectConfiguration'

export class OpenIdConnectRepository {
  private configuration: OpenIdConnectConfiguration

  constructor (configuration: OpenIdConnectConfiguration) {
    this.configuration = configuration
  }

}
