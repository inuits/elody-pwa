import { App, ComputedRef, reactive, Plugin, computed } from 'vue';
import { Router } from 'vue-router';

import { OpenIdConnectRepository } from './repositories/OpenIdConnectRepository';
import { OpenIdConnectConfiguration } from './interfaces/OpenIdConnectConfiguration';
import { postCode, checkLoggedIn, login } from './utils/LoginHelpers';
import { OpenIdConnectRepositoryInterface } from './interfaces/OpenIdConnectRepositoryInterface';

export interface OIDCplugin {
  isAuthenticated: ComputedRef<boolean>;
  loading: ComputedRef<boolean>;
  login: (
    openIdconnectconfiguration: OpenIdConnectConfiguration,
    finalRedirectRoute?: string,
  ) => void;
}

export interface OIDCstate {
  OIDCconfig: OpenIdConnectConfiguration;
  isLoggedIn: boolean;
  loading: boolean;
  repository: OpenIdConnectRepositoryInterface;
  error: any;
}

const defaultConfiguration: OpenIdConnectConfiguration = {
  baseUrl: '',
  tokenEndpoint: '',
  authEndpoint: '',
  logoutEndpoint: '',
  clientId: '',
  authorizedRedirectRoute: '',
  InternalRedirectUrl: '',
  encodeRedirectUrl: false,
};

const state = reactive<OIDCstate>({
  OIDCconfig: defaultConfiguration,
  isLoggedIn: false,
  loading: false,
  repository: new OpenIdConnectRepository(defaultConfiguration),
  error: undefined,
});

export const OIDCplugin: OIDCplugin = {
  isAuthenticated: computed(() => state.isLoggedIn),
  loading: computed(() => state.loading),
  login,
};

export const getConfig = () => state.OIDCconfig;

export async function OpenIdConnectPlugin(options: {
  router: Router;
  configuration: OpenIdConnectConfiguration;
}): Promise<Plugin> {
  if (!options.router) throw new Error('Inuits-vuejs-oidc needs a router');
  if (!options.configuration) throw new Error('Inuits-vuejs-oidc needs configuration');

  state.OIDCconfig = options.configuration;
  state.repository = new OpenIdConnectRepository(state.OIDCconfig);

  try {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const accessCode = urlParams.get('code');

    if (accessCode) {
      state.loading = true;
      const redirectPath = await postCode(accessCode, state.repository, state.OIDCconfig.authorizedRedirectRoute);
      state.loading = false;
      state.isLoggedIn = true;
      options.router.push({ path: redirectPath });
    }
  } catch (e) {
    state.error = e;
  } finally {
    if (!state.isLoggedIn) {
      state.isLoggedIn = await checkLoggedIn(state.repository);
    }
  }

  return {
    install: (app: App) => {
      app.provide('Auth', OIDCplugin);
    },
  };
}
