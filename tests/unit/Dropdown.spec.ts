import { mount, shallowMount } from '@vue/test-utils';
import Dropdown from '@/components/base/Dropdown.vue';
jest.mock('@/types');

let wrapper: any;

describe('Dropdown.vue', () => {
  beforeEach(() => {
    wrapper = shallowMount(Dropdown, {
      props: {
        options: ['5', '10', '15', '20'],
        modelValue: '5',
      },
    });
  });

  it('Renders correctly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });

  it('Option gets selected value for options', () => {
    expect(wrapper.vm.selectedItem).toMatch('5');
  });

  it('renders the correct label', () => {
    const label = wrapper.find('label');
    expect(label.text()).toMatch('');
  });

  it('Updated reactive selected value', () => {
    const option = wrapper.find('option');
    option.setValue('10');
    wrapper.vm.$nextTick(() => {
      expect(wrapper.vm.selectedItem.value).toBe('10');
      expect(wrapper.emitted('update:selected')).toBe('10');
    });
  });
});
