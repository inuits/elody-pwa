import { mount } from '@vue/test-utils'
import Menu from '@/components/Menu.vue'
import { assert, describe, expect, it } from "vitest";

describe('Menucomponent', () => {
    it('renders correctly', () => {
      const wrapper = mount(Menu)
      expect(wrapper.exists()).toBe(false)
    })
  })
  