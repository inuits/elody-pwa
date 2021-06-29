export interface OpenIdConnectRepositoryInterface {
  postCode: (code: string) => Promise<any>
  getLoggedIn: () => Promise<any>
}
