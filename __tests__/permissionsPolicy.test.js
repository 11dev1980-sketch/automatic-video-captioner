import { describe, it, expect } from '@jest/globals';
import { buildPermissionsPolicyHeader } from '../lib/headers/permissionsPolicy';

describe('buildPermissionsPolicyHeader', () => {
  it('should return a valid Permissions-Policy header string', () => {
    const header = buildPermissionsPolicyHeader();
    expect(typeof header).toBe('string');
    expect(header.length).toBeGreaterThan(0);
  });

  it('should include all supported features', () => {
    const header = buildPermissionsPolicyHeader();
    expect(header).toContain('accelerometer=()');
    expect(header).toContain('ambient-light-sensor=()');
    expect(header).toContain('autoplay=()');
    expect(header).toContain('camera=()');
    expect(header).toContain('encrypted-media=()');
    expect(header).toContain('fullscreen=()');
    expect(header).toContain('geolocation=()');
    expect(header).toContain('gyroscope=()');
    expect(header).toContain('magnetometer=()');
    expect(header).toContain('microphone=()');
    expect(header).toContain('midi=()');
    expect(header).toContain('payment=()');
  });

  it('should not include browsing-topics', () => {
    const header = buildPermissionsPolicyHeader();
    expect(header).not.toContain('browsing-topics');
  });

  it('should format features with empty parentheses', () => {
    const header = buildPermissionsPolicyHeader();
    const parts = header.split(', ');
    parts.forEach(part => {
      expect(part).toMatch(/^[a-z-]+=\(\)$/);
    });
  });
});
