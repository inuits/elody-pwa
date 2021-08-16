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

  // it('Has function setSelectedItem() defined', () => {
  //   expect(wrapper.vm.setSelectedItem()).toBeTruthy();
  // });

  // it('Has function toggleMenu() defined', () => {
  //   expect(wrapper.vm.toggleMenu()).toBeTruthy();
  // });

  it('Option displays first value', () => {
    expect(wrapper.find('[value="option"]').text()).toMatch('5');
  });

  it('renders the correct label', () => {
    const label = wrapper.find('label');
    expect(label.text()).toMatch('');
  });

  it("Emits a new value to it's parent", () => {
    wrapper.vm.setSelectedItem('15');
    expect(wrapper.emitted('update:selected')).toEqual([['15']]);
  });

  it('Updated reactive selected value', () => {
    const option = wrapper.find('option');
    option.setValue('10');
    wrapper.vm.$nextTick(() => {
      expect(wrapper.state.selected.value).toBe('10');
    });
  });

  it('', () => { });
});
