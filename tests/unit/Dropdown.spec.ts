import { mount, shallowMount } from '@vue/test-utils';
import Dropdown from '../../src/components/base/Dropdown.vue';
jest.mock('@/types');

let wrapper: any;

describe('Dropdown.vue', () => {
  beforeEach(() => {
    wrapper = shallowMount(Dropdown, {
      props: {
        options: ['5', '10', '15', '20'],
        selected: '5',
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

  it('has the selectedItem ref variable', () => {
    expect(wrapper.vm.selectedItem).toBeTruthy();
  });

  // it("Emits a new value to it's parent", () => {
  //   // wrapper.selectedItem = '15';
  //   wrapper.vm.$nextTick(() => {
  //     // expect(wrapper.emitted('update:selected')).toEqual([['15']]);
  //     // expect(wrapper.emitted('update:selected')).toBe('15');
  //     expect(wrapper.emitted('update:selected')).toBeTruthy();
  //   });
  // });

  it('Updated reactive selected value', () => {
    const option = wrapper.find('option');
    option.setValue('10');
    wrapper.vm.$nextTick(() => {
      expect(wrapper.state.selected.value).toBe('10');
    });
  });
});
