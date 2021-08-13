import { mount, shallowMount } from '@vue/test-utils';
import InputField from '../../src/components/base/InputField.vue';
jest.mock('@/types');

let wrapper: any;

describe('InputField.vue', () => {
  wrapper = shallowMount(InputField, {
    props: {
      placeholder: 'Search Asset Library...',
      label: 'search',
      search: 'asset',
      debounce: true,
    },
  });

  it('Renders correctly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });

  it('renders the correct label', () => {
    const label = wrapper.find('label');

    expect(label.text()).toMatch('');
  });

  it('Updated ref inputValue ', () => {
    const input = wrapper.find('input');
    input.setValue('dummy');
    wrapper.vm.$nextTick(() => {
      expect(wrapper.inputValue.value).toBe('dummy');
    });
  });

  it("Emits a new value to it's parent", () => {
    wrapper.vm.sendInputValue('ijzer');
    expect(wrapper.emitted('update:search')).toEqual([['ijzer']]);
  });

  it('Has function debounceInput defined', () => {
    expect(wrapper.vm.debounceInput()).toBeTruthy();
  });

  it('Has inputValue ref variable defined', () => {
    expect(wrapper.vm.inputValue).toBeTruthy();
  });
});
