import { Metadata, MetaKey } from '@/queries';
import { shallowMount } from '@vue/test-utils';
import { h } from 'vue';
import ListItem from '@/components/ListItem.vue';

const metaLabel1 = MetaKey.Title;
const metaLabel2 = MetaKey.Description;
const metaLabel3 = MetaKey.Collection;
const metaInfo1 = 'Info 1';
const metaInfo2 = 'Info 2';
const metaInfo3 = 'Info 3';

const meta: Metadata[] = [
  { key: metaLabel1, value: metaInfo1 },
  { key: metaLabel2, value: metaInfo2 },
  { key: metaLabel3, value: metaInfo3 },
];

describe('ListItem.vue', () => {
  it('Renders correct meta in ListItem', () => {
    const wrapper = shallowMount(ListItem, { props: { meta } });
    const labels = wrapper.findAll('[data-test="meta-label"]');
    const infos = wrapper.findAll('[data-test="meta-info"]');
    expect(labels[0].text()).toMatch(metaLabel1);
    expect(labels[1].text()).toMatch(metaLabel2);
    expect(labels[2].text()).toMatch(metaLabel3);
    expect(infos[0].text()).toMatch(metaInfo1);
    expect(infos[1].text()).toMatch(metaInfo2);
    expect(infos[2].text()).toMatch(metaInfo3);
  });

  // TODO: Css check with regex, to check if text and bg are not the same, not depending on chosen color
  it('Css classes meta correct on loading', () => {
    const wrapper = shallowMount(ListItem, {
      props: { meta, loading: true },
    });
    const classes = wrapper.findAll('[data-test="meta-row"]')[0].classes();
    expect(classes).toContain('loading');
  });

  it('Css classes meta correct NOT loading', () => {
    const wrapper = shallowMount(ListItem, {
      props: { meta, loading: false },
    });
    const classes = wrapper.findAll('[data-test="meta-row"]')[0].classes();
    expect(classes.includes('loading')).toBe(false);
  });

  it('Test action slot', () => {
    const wrapper = shallowMount(ListItem, {
      props: { meta, loading: false },
      slots: {
        actions: h('h1', {}, 'action slot'),
      },
    });

    expect(wrapper.find('[data-test="action-slot"]').html()).toContain(
      '<h1>action slot</h1>',
    );
  });
});
