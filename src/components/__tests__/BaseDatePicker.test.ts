import { describe, it, expect, vi } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import BaseDatePicker from '../base/BaseDatePicker.vue';
import { VueDatePicker } from '@vuepic/vue-datepicker';

vi.mock('@vuepic/vue-datepicker/dist/main.css', () => ({}));

process.env.TZ = 'UTC';

describe('BaseDatePicker', () => {
  const getComponentWrapper = (props = {}): VueWrapper => {
    return mount(BaseDatePicker, {
      props: {
        type: 'datetime',
        modelValue: undefined,
        ...props,
      },
    });
  };


  it('renders the date picker input', () => {
    const wrapper = getComponentWrapper();

    const input = wrapper.find('input.dp__input');
    expect(input.exists()).toBe(true);
  });

  it('emits the date in the correct ISO format (yyyy-MM-ddTHH:mm:ssXXX) when text input is used', async () => {
    const wrapper = getComponentWrapper();

    const input = wrapper.find('input.dp__input');
    
    await input.setValue('15/01/2026 11:11');
    
    await input.trigger('keydown', { key: 'Enter', code: 'Enter' });
    await wrapper.vm.$nextTick();

    const emittedEvents = wrapper.emitted('update:modelValue');
    expect(emittedEvents).toBeTruthy();

    const emittedValue = emittedEvents?.[emittedEvents.length - 1][0];

    expect(emittedValue).toBe('2026-01-15T11:11:00+00:00');
  });

  it('renders provided value and emits the date in the correct ISO format when text input is used', async () => {
    const wrapper = getComponentWrapper({ modelValue: '2026-01-15T10:11:00+00:00' });

    const input = wrapper.find('input.dp__input');

    await wrapper.vm.$nextTick();

    expect(input.html()).toContain('15/01/2026 10:11');

    await wrapper.vm.$nextTick();
    
    await input.setValue('22/06/2026 11:11');
    
    await input.trigger('keydown', { key: 'Enter', code: 'Enter' });
    await wrapper.vm.$nextTick();

    const emittedEvents = wrapper.emitted('update:modelValue');
    expect(emittedEvents).toBeTruthy();

    const emittedValue = emittedEvents?.[emittedEvents.length - 1][0];

    expect(emittedValue).toBe('2026-06-22T11:11:00+00:00');
  });

  it('enables time picker when type includes "time"', () => {
    const wrapper = getComponentWrapper();

    const datePickerComponent = wrapper.findComponent(VueDatePicker);
    
    expect(datePickerComponent.exists()).toBe(true);

    expect(datePickerComponent.props('timeConfig')).toEqual({
      enableTimePicker: true
    });
  });
  
  it('disables time picker when type does NOT include "time"', () => {
    const wrapper = getComponentWrapper({ type: 'date' });

    const datePickerComponent = wrapper.findComponent(VueDatePicker);
    expect(datePickerComponent.exists()).toBe(true);

    expect(datePickerComponent.props('timeConfig')).toEqual({
      enableTimePicker: false
    });
  });
});