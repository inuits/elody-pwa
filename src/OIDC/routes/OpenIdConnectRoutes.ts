import TokenRedirectPage from '../views/TokenRedirectPage.vue'
import UnauthorizedRedirectPage from '../views/UnauthorizedRedirectPage.vue'
// import { RouteConfig } from 'vue-router'
export const openIdConnectRoutes: any[] = [
  {
    path: '/openid/redirect',
    name: 'openIdConnectTokenRedirect',
    meta: {
      title: 'OpenID redirect'
    },
    component: TokenRedirectPage
  },
  {
    path: '/openid/logout',
    name: 'openIdConnectUnauthorizedRedirect',
    meta: {
      title: 'OpenID logout'
    },
    component: UnauthorizedRedirectPage
  }
]
