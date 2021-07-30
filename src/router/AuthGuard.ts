import { NavigationGuardWithThis } from 'vue-router';
import { watchEffect } from 'vue';
import { useAuth } from '@/OpenIdConnectPlugin';

export const authGuard: NavigationGuardWithThis<undefined> = (_to, _from, next) => {
  const auth = useAuth();

  const verify = () => {
    if (auth.isAuthenticated.value) {
      return next();
    }
    auth?.login();
  };

  // If loading has already finished, check our auth state using `fn()`
  if (!auth.loading.value) {
    return verify();
  }

  // Watch for the loading property to change before we check isAuthenticated
  watchEffect(() => {
    if (!auth.loading.value) {
      return verify();
    }
  });
};
