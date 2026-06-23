import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EntityElementWindow from '../EntityElementWindow.vue';
import { Permission } from '@/generated-types/queries';

const {
  mockFetchAdvancedPermissions,
  mockFetchUpdateAndDeletePermission,
  mockGetEntityUuid,
  mockGetEntityType,
} = vi.hoisted(() => ({
  mockFetchAdvancedPermissions: vi.fn(),
  mockFetchUpdateAndDeletePermission: vi.fn(),
  mockGetEntityUuid: vi.fn(),
  mockGetEntityType: vi.fn(),
}));

vi.mock('@/composables/usePermissions', () => ({
  usePermissions: () => ({
    fetchAdvancedPermissions: mockFetchAdvancedPermissions,
    fetchUpdateAndDeletePermission: mockFetchUpdateAndDeletePermission,
  })
}));

vi.mock('@/composables/useEntitySingle', () => ({
  default: () => ({
    getEntityUuid: mockGetEntityUuid,
    getEntityType: mockGetEntityType,
  }),
}));

vi.mock('@/composables/useEdit', () => ({ useEditMode: () => ({ isEdit: false }) }));
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k }) }));
vi.mock('@/main', () => ({ auth: { isAuthenticated: { value: true } } }));

describe('EntityElementWindow Permission Logic', () => {
  const mockElement = {
    label: 'Test Window',
    item1: { __typename: 'WindowElementPanel', label: 'Public', can: null },
    item2: { __typename: 'WindowElementPanel', label: 'Admin Only', can: 'role:admin' },
    item3: { __typename: 'WindowElementPanel', label: 'Audit Only', can: 'role:audit' },
    item4: { __typename: 'NotAPanel', label: 'Ignore Me' }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchUpdateAndDeletePermission.mockReturnValue(
      Promise.resolve(new Map()),
    );
    mockGetEntityUuid.mockReturnValue(undefined);
    mockGetEntityType.mockReturnValue(undefined);
  });

  it('should initially render zero panels while permissions are loading', async () => {
    mockFetchAdvancedPermissions.mockReturnValue(new Promise(() => {}));
    
    const wrapper = mount(EntityElementWindow, {
      props: { element: mockElement, identifiers: [], formId: '1' }
    });

    const panels = wrapper.findAllComponents({ name: 'EntityElementWindowPanel' });
    expect(panels.length).toBe(0);
  });

  it('should only show panels that meet permission requirements', async () => {
    mockFetchAdvancedPermissions.mockResolvedValue({
      'role:admin': true,
      'role:audit': false
    });

    const wrapper = mount(EntityElementWindow, {
      props: { element: mockElement, identifiers: [], formId: '1' }
    });

    await flushPromises();

    const panels = wrapper.findAllComponents({ name: 'EntityElementWindowPanel' });
    
    expect(panels.length).toBe(2);
    expect(panels[0].props('panel').label).toBe('Public');
    expect(panels[1].props('panel').label).toBe('Admin Only');
  });

  it('should only show panels that meet shared permission requirements', async () => {
    const elementsWithSharedPerms = {
      label: 'Test Window',
      item1: { __typename: 'WindowElementPanel', label: 'Public', can: null },
      item2: { __typename: 'WindowElementPanel', label: 'Admin Only', can: 'role:admin' },
      item3: { __typename: 'WindowElementPanel', label: 'Admin Only (2)', can: 'role:admin' },
      item4: { __typename: 'WindowElementPanel', label: 'Audit Only', can: 'role:audit' },
      item5: { __typename: 'NotAPanel', label: 'Ignore Me' }
    };

    mockFetchAdvancedPermissions.mockResolvedValue({
      'role:admin': true,
      'role:audit': false
    });

    const wrapper = mount(EntityElementWindow, {
      props: { element: elementsWithSharedPerms, identifiers: [], formId: '1' }
    });

    await flushPromises();

    const panels = wrapper.findAllComponents({ name: 'EntityElementWindowPanel' });
    
    expect(panels.length).toBe(3);
    expect(panels[0].props('panel').label).toBe('Public');
    expect(panels[1].props('panel').label).toBe('Admin Only');
    expect(panels[2].props('panel').label).toBe('Admin Only (2)');
  });

  it('should deduplicate permission requests', async () => {
    const elementWithDuplicates = {
      p1: { __typename: 'WindowElementPanel', can: 'shared:perm' },
      p2: { __typename: 'WindowElementPanel', can: 'shared:perm' },
      p3: { __typename: 'WindowElementPanel', can: 'other:perm' }
    };

    mockFetchAdvancedPermissions.mockResolvedValue({});

    mount(EntityElementWindow, {
      props: { element: elementWithDuplicates, identifiers: [], formId: '1' }
    });

    const calledPermissions = mockFetchAdvancedPermissions.mock.calls[0][0];
    
    expect(calledPermissions).toHaveLength(2);
    expect(calledPermissions).toContain('shared:perm');
    expect(calledPermissions).toContain('other:perm');
  });

  it('should show panel if it has no "can" property defined', async () => {
    const elementMixed = {
      p1: { __typename: 'WindowElementPanel', label: 'No Can' },
      p2: { __typename: 'WindowElementPanel', label: 'Null Can', can: null },
      p3: { __typename: 'WindowElementPanel', label: 'Empty Can', can: '' }
    };

    mockFetchAdvancedPermissions.mockResolvedValue({});
    const wrapper = mount(EntityElementWindow, {
      props: { element: elementMixed, identifiers: [], formId: '1' }
    });

    await flushPromises();

    const panels = wrapper.findAllComponents({ name: 'EntityElementWindowPanel' });
    expect(panels.length).toBe(3);
  });

  describe('per-entity permission fallback', () => {
    const elementWithUpdate = {
      label: 'User Detail',
      info: { __typename: 'WindowElementPanel', label: 'User Info', can: null },
      settings: {
        __typename: 'WindowElementPanel',
        label: 'Notification Settings',
        can: 'update:user',
      },
    };

    it('shows panel when advanced denies but per-entity Canupdate is true', async () => {
      mockGetEntityUuid.mockReturnValue('US-9A381RJZF');
      mockGetEntityType.mockReturnValue('user');
      mockFetchAdvancedPermissions.mockResolvedValue({ 'update:user': false });
      mockFetchUpdateAndDeletePermission.mockReturnValue(
        Promise.resolve(new Map([[Permission.Canupdate, true]])),
      );

      const wrapper = mount(EntityElementWindow, {
        props: { element: elementWithUpdate, identifiers: [], formId: '1' },
      });

      await flushPromises();

      const panels = wrapper.findAllComponents({ name: 'EntityElementWindowPanel' });
      expect(panels.length).toBe(2);
      expect(panels[1].props('panel').label).toBe('Notification Settings');
    });

    it('hides panel when advanced denies and per-entity Canupdate is false', async () => {
      mockGetEntityUuid.mockReturnValue('US-9A381RJZF');
      mockGetEntityType.mockReturnValue('user');
      mockFetchAdvancedPermissions.mockResolvedValue({ 'update:user': false });
      mockFetchUpdateAndDeletePermission.mockReturnValue(
        Promise.resolve(new Map([[Permission.Canupdate, false]])),
      );

      const wrapper = mount(EntityElementWindow, {
        props: { element: elementWithUpdate, identifiers: [], formId: '1' },
      });

      await flushPromises();

      const panels = wrapper.findAllComponents({ name: 'EntityElementWindowPanel' });
      expect(panels.length).toBe(1);
      expect(panels[0].props('panel').label).toBe('User Info');
    });

    it('does not fall back when can target type mismatches current entity type', async () => {
      mockGetEntityUuid.mockReturnValue('PR-1');
      mockGetEntityType.mockReturnValue('production');
      mockFetchAdvancedPermissions.mockResolvedValue({ 'update:user': false });
      mockFetchUpdateAndDeletePermission.mockReturnValue(
        Promise.resolve(new Map([[Permission.Canupdate, true]])),
      );

      const wrapper = mount(EntityElementWindow, {
        props: { element: elementWithUpdate, identifiers: [], formId: '1' },
      });

      await flushPromises();

      const panels = wrapper.findAllComponents({ name: 'EntityElementWindowPanel' });
      expect(panels.length).toBe(1);
      expect(panels[0].props('panel').label).toBe('User Info');
    });

    it('shows panel when advanced grants even without per-entity fallback', async () => {
      mockGetEntityUuid.mockReturnValue('US-9A381RJZF');
      mockGetEntityType.mockReturnValue('user');
      mockFetchAdvancedPermissions.mockResolvedValue({ 'update:user': true });
      mockFetchUpdateAndDeletePermission.mockReturnValue(
        Promise.resolve(new Map([[Permission.Canupdate, false]])),
      );

      const wrapper = mount(EntityElementWindow, {
        props: { element: elementWithUpdate, identifiers: [], formId: '1' },
      });

      await flushPromises();

      const panels = wrapper.findAllComponents({ name: 'EntityElementWindowPanel' });
      expect(panels.length).toBe(2);
    });

    it('falls back to Candelete for delete action', async () => {
      const deletePanelElement = {
        info: { __typename: 'WindowElementPanel', label: 'Info', can: null },
        danger: {
          __typename: 'WindowElementPanel',
          label: 'Delete Zone',
          can: 'delete:user',
        },
      };

      mockGetEntityUuid.mockReturnValue('US-9A381RJZF');
      mockGetEntityType.mockReturnValue('user');
      mockFetchAdvancedPermissions.mockResolvedValue({ 'delete:user': false });
      mockFetchUpdateAndDeletePermission.mockReturnValue(
        Promise.resolve(new Map([[Permission.Candelete, true]])),
      );

      const wrapper = mount(EntityElementWindow, {
        props: { element: deletePanelElement, identifiers: [], formId: '1' },
      });

      await flushPromises();

      const panels = wrapper.findAllComponents({ name: 'EntityElementWindowPanel' });
      expect(panels.length).toBe(2);
      expect(panels[1].props('panel').label).toBe('Delete Zone');
    });
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
      mockFetchAdvancedPermissions.mockResolvedValue({});

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
      mockFetchAdvancedPermissions.mockResolvedValue({});

      const wrapper = mount(EntityElementWindow, {
        props: { element: { label: 'Test Window' }, identifiers: [], formId: '1' },
        global: { stubs: { BaseContextMenuActions: baseContextMenuStub } }
      });

      await flushPromises();

      expect(wrapper.findComponent({ name: 'BaseContextMenuActions' }).exists()).toBe(false);
    });
  });
});