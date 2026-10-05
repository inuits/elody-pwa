import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EntityElementWindow from '../EntityElementWindow.vue';

vi.mock('@/composables/useEdit', () => ({
  useEditMode: () => ({ isEdit: false, showErrors: true }),
}));
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k }) }));
vi.mock('@/main', () => ({ auth: { isAuthenticated: { value: true } } }));

describe('EntityElementWindow panels', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // The graphql layer resolves panel permissions and leaves out what the user
  // may not see, so an arriving panel is rendered without further checks.
  it('renders every panel it was handed', async () => {
    const element = {
      label: 'Test Window',
      item1: { __typename: 'WindowElementPanel', label: 'Public', can: null },
      item2: {
        __typename: 'WindowElementPanel',
        label: 'Admin Only',
        can: 'role:admin',
      },
      item3: { __typename: 'NotAPanel', label: 'Ignore Me' },
    };

    const wrapper = mount(EntityElementWindow, {
      props: { element, identifiers: [], formId: '1' },
    });
    await flushPromises();

    const panels = wrapper.findAllComponents({
      name: 'EntityElementWindowPanel',
    });
    expect(panels.length).toBe(2);
    expect(panels[0].props('panel').label).toBe('Public');
    expect(panels[1].props('panel').label).toBe('Admin Only');
  });

  it('renders nothing for a panel the graphql layer left out', async () => {
    const element = {
      label: 'Test Window',
      info: { __typename: 'WindowElementPanel', label: 'Info' },
      settings: null,
    };

    const wrapper = mount(EntityElementWindow, {
      props: { element, identifiers: [], formId: '1' },
    });
    await flushPromises();

    const panels = wrapper.findAllComponents({
      name: 'EntityElementWindowPanel',
    });
    expect(panels.length).toBe(1);
    expect(panels[0].props('panel').label).toBe('Info');
  });

  // Used in dams (and other clients) for things like the refresh-metadata action
  // on the window header. Tests exist to make sure that doesn't happen again
  describe('window header context menu', () => {
    const contextMenuActions = [
      { type: 'elody', action: 'RefreshMetadata', label: 'header.refresh', icon: 'Refresh' }
    ];

    const baseContextMenuStub = {
      name: 'BaseContextMenuActions',
      props: ['contextMenuActions', 'parentEntityId'],
      template: '<div />'
    };

    it('renders BaseContextMenuActions when element.contextMenuActions is provided', async () => {

      const wrapper = mount(EntityElementWindow, {
        props: {
          element: { label: 'Test Window', contextMenuActions },
          identifiers: [],
          formId: '1'
        },
        global: { stubs: { BaseContextMenuActions: baseContextMenuStub } }
      });

      await flushPromises();

      const menu = wrapper.findComponent({ name: 'BaseContextMenuActions' });
      expect(menu.exists()).toBe(true);
      expect(menu.props('contextMenuActions')).toEqual(contextMenuActions);
      expect(menu.props('parentEntityId')).toBe('1');
    });

    it('does not render BaseContextMenuActions when element.contextMenuActions is missing', async () => {

      const wrapper = mount(EntityElementWindow, {
        props: { element: { label: 'Test Window' }, identifiers: [], formId: '1' },
        global: { stubs: { BaseContextMenuActions: baseContextMenuStub } }
      });

      await flushPromises();

      expect(wrapper.findComponent({ name: 'BaseContextMenuActions' }).exists()).toBe(false);
    });
  });

  describe('window element status', () => {
    const metadataWrapperStub = {
      name: 'MetadataWrapper',
      props: ['metadata', 'formId', 'isEdit', 'showErrors'],
      template: '<div data-testid="status-field" />',
    };

    const buildElement = (validation?: Record<string, any>) => ({
      label: 'Test Window',
      windowElementStatus: {
        label: 'metadata.labels.status',
        statusMetadataKey: 'status_field',
        statusInputField: {
          type: 'dropdownSingleselectMetadata',
          options: [],
          ...(validation ? { validation } : {}),
        },
      },
    });

    const mountWithStatus = async (validation?: Record<string, any>) => {
      const wrapper = mount(EntityElementWindow, {
        props: {
          element: buildElement(validation),
          identifiers: [],
          formId: '1',
          isEditOverwrite: true,
        },
        global: { stubs: { MetadataWrapper: metadataWrapperStub } },
      });
      await flushPromises();
      return wrapper;
    };

    it('forwards the edit state showErrors to the status field', async () => {
      const wrapper = await mountWithStatus({ value: ['required'] });

      const statusField = wrapper.findComponent({ name: 'MetadataWrapper' });
      expect(statusField.exists()).toBe(true);
      expect(statusField.props('showErrors')).toBe(true);
    });

    it('hands the status field its validation so the generic field renders it', async () => {
      const wrapper = await mountWithStatus({ value: ['required'] });

      const metadata = wrapper
        .findComponent({ name: 'MetadataWrapper' })
        .props('metadata') as any;
      expect(metadata.inputField.validation).toEqual({ value: ['required'] });
    });

    it('hands the configured label to the status field instead of rendering its own', async () => {
      const wrapper = await mountWithStatus({ value: ['required'] });

      const metadata = wrapper
        .findComponent({ name: 'MetadataWrapper' })
        .props('metadata') as any;
      expect(metadata.label).toBe('metadata.labels.status');
      expect(wrapper.find('h2').exists()).toBe(false);
    });
  });
});