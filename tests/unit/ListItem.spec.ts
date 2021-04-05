import { metadata } from '@/queries/entities'
import { shallowMount } from '@vue/test-utils'
import { h } from 'vue'
import ListItem from '../../src/components/ListItem.vue'

const metaLabel1 = 'Label 1'
const metaLabel2 = 'Label 2'
const metaLabel3 = 'Label 3'
const metaInfo1 = 'Info 1'
const metaInfo2 = 'Info 2'
const metaInfo3 = 'Info 3'

const metaProp: metadata[] = [
  { key: metaLabel1, value: metaInfo1 },
  { key: metaLabel2, value: metaInfo2 },
  { key: metaLabel3, value: metaInfo3 }
]

describe('ListItem.vue', () => {
  it('Renders correct meta in ListItem', () => {
    const wrapper = shallowMount(ListItem, {
      props: {
        meta: metaProp
      }
    })

    expect(wrapper.findAll('[data-test="meta-label"]')[0].text()).toMatch(
      metaLabel1
    )
    expect(wrapper.findAll('[data-test="meta-label"]')[1].text()).toMatch(
      metaLabel2
    )
    expect(wrapper.findAll('[data-test="meta-label"]')[2].text()).toMatch(
      metaLabel3
    )
    expect(wrapper.findAll('[data-test="meta-info"]')[0].text()).toMatch(
      metaInfo1
    )
    expect(wrapper.findAll('[data-test="meta-info"]')[1].text()).toMatch(
      metaInfo2
    )
    expect(wrapper.findAll('[data-test="meta-info"]')[2].text()).toMatch(
      metaInfo3
    )
  })

  // TODO: Css check with regex, to check if text and bg are not the same, not depending on chosen color
  it('Css classes meta correct on loading', () => {
    const wrapper = shallowMount(ListItem, {
      props: {
        meta: metaProp,
        loading: true
      }
    })

    const labelClasses = wrapper
      .findAll('[data-test="meta-label"]')[0]
      .classes()
    const infoClasses = wrapper.findAll('[data-test="meta-info"]')[0].classes()

    expect(labelClasses).toContain('text-neutral-20')
    expect(labelClasses).toContain('bg-neutral-20')

    expect(infoClasses).toContain('text-neutral-20')
    expect(infoClasses).toContain('bg-neutral-20')
  })

  it('Css classes meta correct NOT loading', () => {
    const wrapper = shallowMount(ListItem, {
      props: {
        meta: metaProp,
        loading: false
      }
    })

    const labelClasses = wrapper
      .findAll('[data-test="meta-label"]')[0]
      .classes()
    const infoClasses = wrapper.findAll('[data-test="meta-info"]')[0].classes()

    expect(labelClasses.includes('text-neutral-20')).toBe(false)
    expect(labelClasses.includes('bg-neutral-20')).toBe(false)
    expect(labelClasses).toContain('text-neutral-60')

    expect(infoClasses.includes('text-neutral-20')).toBe(false)
    expect(infoClasses.includes('bg-neutral-20')).toBe(false)
    expect(infoClasses).toContain('text-neutral-700')
  })

  it('Test action slot', () => {
    const wrapper = shallowMount(ListItem, {
      slots: {
        actions: h('h1', {}, 'action slot')
      }
    })

    expect(wrapper.find('[data-test="action-slot"]').html()).toContain(
      '<h1>action slot</h1>'
    )
  })
})
