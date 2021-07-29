import { shallowMount } from '@vue/test-utils'
import { Metadata } from '@/queries'
import { postCode, checkLoggedIn } from '../utils/LoginHelpers'

const metaProp: Metadata[] = []

jest.mock('../repository/OpenIdConnectRepository', () => ({
  postCode: () => {
    return new Promise((resolve, reject) => {
      resolve('Posted succesfully')
    })
  },
  getLoggedIn: () => {
    return new Promise((resolve, reject) => {
      resolve('Loggedin succesfully')
    })
  }
}))

describe('LoginHelpers', () => {
  it('Posts authentication code correctly', () => {
    /*const wrapper = shallowMount(LoginHelpers, {
      props: {
        meta: metaProp
      }
    })*/
    /*expect(postCode).toMatch(
      
    )*/
  })
})
