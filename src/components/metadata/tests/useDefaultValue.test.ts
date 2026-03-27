import { describe, it, expect, vi, beforeEach } from 'vitest';
import { format } from 'date-fns';
import { useDefaultValue } from '../useDefaultValue';

vi.mock('date-fns', () => ({
  format: vi.fn(),
}));

describe('useDefaultValue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not call onUpdate if defaultValue is undefined', () => {
    const onUpdate = vi.fn();
    
    useDefaultValue({ onUpdate });
    
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('does not call onUpdate if defaultValue is an empty string', () => {
    const onUpdate = vi.fn();
    
    useDefaultValue({ defaultValue: '', onUpdate });
    
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('calls onUpdate immediately with the provided standard string', () => {
    const onUpdate = vi.fn();
    const staticValue = 'testValue';
    
    useDefaultValue({ defaultValue: staticValue, onUpdate });
    
    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate).toHaveBeenCalledWith(staticValue);
    expect(format).not.toHaveBeenCalled(); 
  });

  it('formats the current date and calls onUpdate when defaultValue is "$now"', () => {
    const onUpdate = vi.fn();
    const mockFormattedDate = '2026-03-27T09:22:25+01:00';
    
    vi.mocked(format).mockReturnValue(mockFormattedDate);

    useDefaultValue({ defaultValue: '$now', onUpdate });

    expect(format).toHaveBeenCalledTimes(1);
    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate).toHaveBeenCalledWith(mockFormattedDate);
  });
});