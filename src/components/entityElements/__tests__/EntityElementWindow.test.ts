import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EntityElementWindow from '../EntityElementWindow.vue';

const { mockFetchAdvancedPermissions } = vi.hoisted(() => ({
  mockFetchAdvancedPermissions: vi.fn()
}));

vi.mock('@/composables/usePermissions', () => ({
  usePermissions: () => ({
    fetchAdvancedPermissions: mockFetchAdvancedPermissions
  })
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
});