import { shallowMount } from '@vue/test-utils'
import Pagination from '../../src/components/base/Pagination.vue'

describe('Pagination.vue', () => {
  it('Renders correct intial page count', () => {
    const wrapper = shallowMount(Pagination, {
      props: {
        paginationInfo: {
          skip: 0,
          limit: 20
        },
        maxPage: 8
      }
    })

    expect(wrapper.find('[data-test="page-count-label"]').text()).toMatch(
      'Page 1 of 8'
    )
  })

  it('Page up event', () => {
    const wrapper = shallowMount(Pagination, {
      props: {
        paginationInfo: {
          skip: 0,
          limit: 20
        },
        maxPage: 8
      }
    })

    wrapper.vm.next()
    const updatePaginationInfoEvent = wrapper.emitted('update:paginationInfo')

    expect(updatePaginationInfoEvent).toEqual([[{ limit: 20, skip: 1 }]])
  })

  it('Page down event', () => {
    const wrapper = shallowMount(Pagination, {
      props: {
        paginationInfo: {
          skip: 5,
          limit: 20
        },
        maxPage: 8
      }
    })

    wrapper.vm.prev()
    const updatePaginationInfoEvent = wrapper.emitted('update:paginationInfo')

    expect(updatePaginationInfoEvent).toEqual([[{ limit: 20, skip: 4 }]])
  })

  it('Page max -> no emit', () => {
    const wrapper = shallowMount(Pagination, {
      props: {
        paginationInfo: {
          skip: 8,
          limit: 20
        },
        maxPage: 8
      }
    })

    wrapper.vm.next()
    expect(wrapper.emitted('update:paginationInfo')).toBe(undefined)
  })

  it('Page min -> no emit', () => {
    const wrapper = shallowMount(Pagination, {
      props: {
        paginationInfo: {
          skip: 0,
          limit: 20
        },
        maxPage: 8
      }
    })

    wrapper.vm.prev()
    expect(wrapper.emitted('update:paginationInfo')).toBe(undefined)
  })

  // TODO: Css check with regex, to check if text and bg are not the same, not depending on chosen color
  it('Css classes meta correct on loading', () => {
    const wrapper = shallowMount(Pagination, {
      props: {
        loading: true,
        paginationInfo: {
          skip: 0,
          limit: 20
        }
      }
    })

    expect(wrapper.classes()).toContain('text-neutral-20')
    expect(wrapper.classes()).toContain('bg-neutral-20')
  })

  it('Css classes meta correct NOT loading', () => {
    const wrapper = shallowMount(Pagination, {
      props: {
        loading: false,
        paginationInfo: {
          skip: 0,
          limit: 20
        }
      }
    })

    expect(wrapper.classes().includes('text-neutral-20')).toBe(false)
    expect(wrapper.classes().includes('bg-neutral-20')).toBe(false)
    expect(wrapper.classes()).toContain('text-neutral-700')
  })
})
