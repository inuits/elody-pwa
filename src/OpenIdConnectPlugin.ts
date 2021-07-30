import { App, ref, reactive, Ref, Plugin, inject } from 'vue';
import { Router } from 'vue-router';

const loginRedirectRouteKey = 'oidc-login-redirect-route';

export interface OpenIdConnectConfiguration {
  baseUrl: string;
  tokenEndpoint: string;
  authEndpoint: string;
  logoutEndpoint: string;
  clientId: string;
  clientSecret?: string;
  scope?: string;
  authorizedRedirectRoute: string;
  // If not filled in then application will automatically redirect to openid provider
  unauthorizedRedirectRoute?: string;
  // Properties needed for doing token call on backend server (more secure and keeps clientSecret out of frontend config)
  serverBaseUrl?: string;
  serverTokenEndpoint?: string;
  serverRefreshEndpoint?: string;
  internalRedirectUrl?: string;
  encodeRedirectUrl?: boolean;
  apiCodeEndpoint?: string;
}
const defaultConfig: OpenIdConnectConfiguration = {
  baseUrl: '',
  serverBaseUrl: undefined,
  tokenEndpoint: 'token',
  authEndpoint: 'auth',
  logoutEndpoint: 'logout',
  clientId: '',
  authorizedRedirectRoute: '/',
  serverTokenEndpoint: 'token/',
  serverRefreshEndpoint: 'refresh/',
  internalRedirectUrl: '',
  apiCodeEndpoint: '',
  encodeRedirectUrl: false,
};

export interface OpenIdConnectUserInformation {
  name: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
  email: string;
}

export class OpenIdConnectPlugin {
  isAuthenticated: Ref<boolean>;
  loading: Ref<boolean>;
  error: Ref<any>;
  config: OpenIdConnectConfiguration;

  constructor(config: Partial<OpenIdConnectConfiguration>) {
    this.isAuthenticated = ref(false);
    this.loading = ref(false);
    this.error = ref(undefined);
    this.config = reactive({ ...defaultConfig, ...config });
  }

  async checkLoggedIn() {
    const res = await fetch('/api/me', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    return res.status !== 401;
  }

  async postCode(authCode: string) {
    const { baseUrl, clientId, tokenEndpoint, internalRedirectUrl } = this.config;
    await fetch(`${this.config.apiCodeEndpoint}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        realm: baseUrl,
        authCode,
        clientId,
        tokenEndpoint,
        redirectUri: buildInternalRedirectUrl(internalRedirectUrl, false),
      }),
    });
    const storedRedirectRoute = sessionStorage.getItem(loginRedirectRouteKey) || '';
    sessionStorage.removeItem(loginRedirectRouteKey);
    return storedRedirectRoute || this.config.authorizedRedirectRoute;
  }

  login(finalRedirectRoute?: string) {
    // Save final redirect route in session storage so it can be used at the end of the openid flow
    if (finalRedirectRoute) {
      sessionStorage.setItem(loginRedirectRouteKey, finalRedirectRoute);
    }

    const { authEndpoint, baseUrl, clientId, encodeRedirectUrl, internalRedirectUrl, scope } = this.config;
    const redirectUrl = buildInternalRedirectUrl(internalRedirectUrl, !encodeRedirectUrl);
    const builtAuthEndpoint = buildAuthEndpoint(authEndpoint, encodeRedirectUrl);
    const params = buildOpenIdParameterString(
      {
        scope: scope || 'openid',
        client_id: clientId,
        response_type: 'code',
        redirect_uri: redirectUrl,
      },
      encodeRedirectUrl,
    );
    window.location.href = `${baseUrl}/${builtAuthEndpoint}${params}`;
  }

  static async build(router: Router, config: Partial<OpenIdConnectConfiguration>): Promise<Plugin> {
    const plugin = new OpenIdConnectPlugin(config);
    const accessCode = (new URLSearchParams(window.location.search)).get('code');
    if (accessCode) {
      plugin.loading.value = true;
      try {
        const redirectPath = await plugin.postCode(accessCode);
        plugin.loading.value = false;
        plugin.isAuthenticated.value = true;
        router.push({ path: redirectPath });
      } catch (e) {
        plugin.loading.value = false;
        plugin.error.value = e;
      }
    }
    if (!plugin.isAuthenticated.value) {
      plugin.isAuthenticated.value = await plugin.checkLoggedIn();
    }

    return {
      install: (app: App) => app.provide(DefaultAuth, plugin),
    };
  }
}

export const DefaultAuth: unique symbol = Symbol('Auth');
export const useAuth = () => inject<OpenIdConnectPlugin>(DefaultAuth)!;

function buildAuthEndpoint(authEndpoint: string, encoded = false): string {
  // FIXME: Doesn't work, in general!
  if (!encoded) {
    return authEndpoint;
  }
  const [before, after] = authEndpoint.split('ReturnUrl=');
  return before + 'ReturnUrl=' + encodeURIComponent(after);
}

function buildOpenIdParameterString(params: object, encoded = false): string {
  const paramArray = Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&');
  return encoded ? encodeURIComponent(`?${paramArray}`) : `?${paramArray}`;
}

function buildInternalRedirectUrl(endpoint?: string, encoded = true): string {
  const { protocol, hostname, port } = window.location;
  const portString = port ? `:${port}` : '';
  const redirectUrl = `${protocol}//${hostname}${portString}/${endpoint}`;
  return encoded ? encodeURIComponent(redirectUrl) : redirectUrl;
}
