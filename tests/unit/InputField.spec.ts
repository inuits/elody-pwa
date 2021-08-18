import { shallowMount } from '@vue/test-utils';
import InputField from '../../src/components/base/InputField.vue';
jest.mock('@/types');

let wrapper: any;

describe('InputField.vue', () => {
  wrapper = shallowMount(InputField, {
    props: {
      placeholder: 'Search Asset Library...',
      label: 'search',
      search: 'asset',
      debounce: false,
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
      expect(wrapper.emitted('update:modelValue')).toEqual([['dummy']]);
    });
  });
});
