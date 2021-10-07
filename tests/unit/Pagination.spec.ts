import { shallowMount } from '@vue/test-utils';
import Pagination from '../../src/components/base/Pagination.vue';
jest.mock('@/types');

const defaultProps = {
  skip: 0,
  limit: 20,
  totalItems: 8,
};

describe('Pagination.vue', () => {
  it('Calculates the correct maxPage depending on totalItems', () => {
    const wrapper = shallowMount(Pagination, {
      props: { defaultProps, totalItems: 28 },
    });

    const maxPage = wrapper.vm.maxPage();
    wrapper.vm.$nextTick(() => expect(maxPage).toBe(3));
  });

  it('Renders correct intial page count > 1', () => {
    const wrapper = shallowMount(Pagination, {
      props: { defaultProps, totalItems: 40 },
    });
    expect(wrapper.find('[data-test="page-count-label"]').text()).toMatch('Page 1 of 2');
  });

  it('Renders correct page count when 1 item', () => {
    const wrapper = shallowMount(Pagination, {
      props: { defaultProps, totalItems: 1 },
    });
    expect(wrapper.find('[data-test="page-count-label"]').text()).toMatch('Page 1 of 1');
  });

  it("Page up event", () => {
    const wrapper = shallowMount(Pagination, {
      props: defaultProps,
    });
    wrapper.vm.next(1);
    wrapper.vm.$nextTick(() => {
      expect(wrapper.emitted("update:skip")).toEqual([[1]]);
    });
  });

  it("Five pages up event", () => {
    const wrapper = shallowMount(Pagination, {
      props: defaultProps,
    });
    wrapper.vm.next(5);
    wrapper.vm.$nextTick(() => {
      expect(wrapper.emitted("update:skip")).toEqual([[5]]);
    });
  });

  it("Page down event", () => {
    const wrapper = shallowMount(Pagination, {
      props: { ...defaultProps, skip: 5 },
    });
    wrapper.vm.prev(1);
    expect(wrapper.emitted("update:skip")).toEqual([[4]]);
  });

  it("Five pages down event", () => {
    const wrapper = shallowMount(Pagination, {
      props: { ...defaultProps, skip: 5 },
    });
    wrapper.vm.prev(5);
    expect(wrapper.emitted("update:skip")).toEqual([[1]]);
  });

  it("Page max -> no emit", () => {
    const wrapper = shallowMount(Pagination, {
      props: { ...defaultProps, skip: 8 },
    });
    wrapper.vm.next(1);
    expect(wrapper.emitted("update:skip")).toBe(undefined);
  });

  it("Page min -> no emit", () => {
    const wrapper = shallowMount(Pagination, {
      props: defaultProps,
    });
    wrapper.vm.prev(1);
    expect(wrapper.emitted("update:skip")).toBe(undefined);
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
