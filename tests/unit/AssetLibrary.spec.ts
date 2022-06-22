import Assetlibrary from '../../src/AssetLibrary.vue';
import { shallowMount } from '@vue/test-utils';
jest.mock('@/types');

describe('AssetLibrary.vue', () => {
  it('show FilterSideBar when showdrawer is false', () => {});
  const wrapper = shallowMount(Assetlibrary, {});
});
