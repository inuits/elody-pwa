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

    // At rest and while editing, the status is as wide as its content (the
    // whole pill; the dropdown, then Bewaar/Annuleer), never a fixed share
    // of the header and never the whole header.
    it('sizes the status to its content, at rest and while it is edited', async () => {
      const wrapper = await mountWithStatus();
      const status = wrapper.find('[data-cy="window-header-status"]');
      expect(status.classes()).not.toContain('w-1/4');
      expect(status.classes()).not.toContain('flex-1');
      expect(status.classes()).not.toContain('grow');
      expect(status.classes()).toContain('min-w-0');
    });

    // In a narrow window (a WEM column) the status moves onto its own header
    // line, at its own width, instead of being squeezed or running past the
    // window's edge.
    it('wraps the status onto its own line when it does not fit beside the title', async () => {
      const wrapper = await mountWithStatus();
      const header = wrapper.find('[data-cy="window-header"]');
      expect(header.classes()).toContain('flex-wrap');
    });

    // On its own line the dropdown keeps its options' width rather than
    // stretching across the line when Bewaar/Annuleer wrap below it.
    it('keeps the status dropdown at its own width on a line of its own', async () => {
      const wrapper = await mountWithStatus();
      const status = wrapper.find('[data-cy="window-header-status"]');
      expect(status.classes()).toContain('[&_[data-cy=inline-editor-input]]:grow-0');
    });
  });
});

describe('EntityElementWindow as a PanelShell (panel-and-block-shells.md)', () => {
  const mountPanel = async () => {
    const wrapper = mount(EntityElementWindow, {
      props: { element: { label: 'Inscription info' }, identifiers: [], formId: '1' },
    });
    await flushPromises();
    return wrapper;
  };

  it('is a white card with a 1px panel border and card radius, no shadow', async () => {
    const card = (await mountPanel()).find('[data-cy="entity-element-window"] > section');
    expect(card.classes()).toEqual(
      expect.arrayContaining(['bg-surface', 'border', 'border-border-panel', 'rounded-card']),
    );
  });

  it('has the accent-light header band', async () => {
    const header = (await mountPanel()).find('[data-cy="window-header"]');
    expect(header.classes()).toEqual(
      expect.arrayContaining([
        'bg-surface-panel-header',
        'border-b',
        'border-border-panel',
        'p-(--panel-header-pad)',
      ]),
    );
  });

  it('titles the panel as an h3 at the panel title size, in panel-header ink', async () => {
    const title = (await mountPanel()).find('[data-cy="entity-element-window-title"]');
    expect(title.element.tagName).toBe('H3');
    expect(title.classes()).toEqual(
      expect.arrayContaining([
        'text-(length:--text-panel-title)',
        'font-black',
        'text-text-panel-header',
      ]),
    );
  });

  it('is a region named by its title', async () => {
    const wrapper = await mountPanel();
    const region = wrapper.find('[role="region"]');
    const title = wrapper.find('[data-cy="entity-element-window-title"]');
    expect(region.attributes('aria-labelledby')).toBe(title.attributes('id'));
  });

  it('separates its blocks with a faint hairline, the last one without', async () => {
    const wrapper = mount(EntityElementWindow, {
      props: {
        element: {
          label: 'W',
          a: { __typename: 'WindowElementPanel', label: 'A' },
          b: { __typename: 'WindowElementPanel', label: 'B' },
        },
        identifiers: [],
        formId: '1',
      },
    });
    await flushPromises();
    const block = wrapper.findAll('[data-cy="window-block"]')[0];
    expect(block.classes()).toEqual(
      expect.arrayContaining(['border-b', 'border-border-faint', 'last:border-b-0']),
    );
    expect(block.classes()).not.toContain('border-b-2');
  });

  it('pads its body like a panel', async () => {
    const body = (await mountPanel()).find('[data-cy="window-body"]');
    expect(body.classes()).toContain('p-(--panel-body-pad)');
  });
});

// preview-panel.md: the preview's metadata sits in the preview panel itself,
// under a hairline; no second card or header repeating the title.
describe('EntityElementWindow in a compact preview', () => {
  const element = {
    label: 'Mediafile',
    info: { __typename: 'WindowElementPanel', label: 'Info' },
  };
  const mountWindow = (compact: boolean) =>
    mount(EntityElementWindow, {
      props: { element, identifiers: [], formId: '1', previewLabel: 'file.png' },
      global: {
        provide: { CompactPreview: compact },
        stubs: { EntityElementWindowPanel: true },
      },
    });

  it('draws no card and no header', () => {
    const wrapper = mountWindow(true);

    expect(wrapper.find('[data-cy="window-header"]').exists()).toBe(false);
    expect(wrapper.find('[role="region"]').exists()).toBe(false);
    expect(wrapper.find('[data-cy="window-body"]').exists()).toBe(true);
  });

  it('keeps the panel shell outside a preview', () => {
    const wrapper = mountWindow(false);

    expect(wrapper.find('[data-cy="window-header"]').exists()).toBe(true);
    expect(wrapper.find('[role="region"]').exists()).toBe(true);
  });
});
