import { shallowMount } from '@vue/test-utils';
import Pagination from '../../src/components/base/Pagination.vue';
jest.mock('@/types');

const defaultProps = {
  skip: 0,
  limit: 20,
  maxPage: 8,
};

describe('Pagination.vue', () => {
  it('Renders correct intial page count', () => {
    const wrapper = shallowMount(Pagination, {
      props: defaultProps,
    });
    expect(wrapper.find('[data-test="page-label"]').text()).toMatch('Page 1 of 8');
  });

  it('Page up event', () => {
    const wrapper = shallowMount(Pagination, {
      props: defaultProps,
    });
    wrapper.vm.next();
    expect(wrapper.emitted('update:skip')).toEqual([[1]]);
  });

  it('Page down event', () => {
    const wrapper = shallowMount(Pagination, {
      props: { ...defaultProps, skip: 5 },
    });
    wrapper.vm.prev();
    expect(wrapper.emitted('update:skip')).toEqual([[4]]);
  });

  it('Page max -> no emit', () => {
    const wrapper = shallowMount(Pagination, {
      props: { ...defaultProps, skip: 8 },
    });
    wrapper.vm.next();
    expect(wrapper.emitted('update:skip')).toBe(undefined);
  });

  it('Page min -> no emit', () => {
    const wrapper = shallowMount(Pagination, {
      props: defaultProps,
    });
    wrapper.vm.prev();
    expect(wrapper.emitted('update:skip')).toBe(undefined);
  });

  it('Css classes meta correct on loading', () => {
    const wrapper = shallowMount(Pagination, {
      props: { ...defaultProps, loading: true },
    });
    expect(wrapper.classes()).toContain('text-neutral-20');
    expect(wrapper.classes()).toContain('bg-neutral-20');
  });

  it('Css classes meta correct NOT loading', () => {
    const wrapper = shallowMount(Pagination, {
      props: defaultProps,
    });
    expect(wrapper.classes().includes('text-neutral-20')).toBe(false);
    expect(wrapper.classes().includes('bg-neutral-20')).toBe(false);
    expect(wrapper.classes()).toContain('text-neutral-700');
  });
});
