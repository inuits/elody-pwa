import { shallowMount } from '@vue/test-utils'
import { metadata } from '@/queries/entities'
import {postCode, checkLoggedIn} from '../utils/LoginHelpers'

const metaProp: metadata[] = []


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
