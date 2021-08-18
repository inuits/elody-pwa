import { MetaKey } from '@/queries';
import { shallowMount } from '@vue/test-utils';
import MetaView from '@/components/MetaView.vue';

const metaLabel1 = MetaKey.Title;
const metaLabel2 = MetaKey.Type;
const metaLabel3 = MetaKey.Collection;
const metaInfo1 = 'Info 1';
const metaInfo2 = 'Info 2';
const metaInfo3 = 'Info 3';

const props = {
  error: '',
  loading: false,
  editMode: false,
  startEdit: () => { },
  discardEdit: () => { },
  saveEdit: () => { },
  metadata: [
    { key: metaLabel1, value: metaInfo1 },
    { key: metaLabel2, value: metaInfo2 },
    { key: metaLabel3, value: metaInfo3 },
  ],
};

describe('MetaView.vue', () => {
  it('Renders correct meta in MetaView', () => {
    const wrapper = shallowMount(MetaView, { props });
    const labels = wrapper.findAll('[data-test="meta-label"]');
    const info = wrapper.findAll('[data-test="meta-info"]');

    expect(labels[0].text()).toMatch(metaLabel1);
    expect(labels[1].text()).toMatch(metaLabel2);
    expect(labels[2].text()).toMatch(metaLabel3);
    expect(info[0].text()).toMatch(metaInfo1);
    expect(info[1].text()).toMatch(metaInfo2);
    expect(info[2].text()).toMatch(metaInfo3);
  });

  it('Css classes meta correct on loading', () => {
    const wrapper = shallowMount(MetaView, {
      props: { ...props, loading: true },
    });
    const labels = wrapper.findAll('[data-test="meta-label"]');
    const info = wrapper.findAll('[data-test="meta-info"]');

    expect(labels[0].classes()).toContain('loading');
    expect(info[0].classes()).toContain('loading');
  });

  it('Css classes meta correct NOT loading', () => {
    const wrapper = shallowMount(MetaView, {
      props: { ...props, loading: false },
    });
    const labelClasses = wrapper.findAll('[data-test="meta-label"]')[0].classes();
    const infoClasses = wrapper.findAll('[data-test="meta-info"]')[0].classes();

    expect(labelClasses.includes('loading')).toBe(false);
    expect(infoClasses.includes('loading')).toBe(false);
  });
});
