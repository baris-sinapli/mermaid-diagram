import { describe, expect, it } from 'vitest';

import { formatFileSize, formatTimeAgo } from './format';

function parseSize(formatted: string): { value: number; unit: string } {
  const match = formatted.match(/^([\d.]+)\s*([A-Za-z]+)$/);
  if (!match) {
    throw new Error(`Unexpected file size format: "${formatted}"`);
  }
  return { value: parseFloat(match[1]), unit: match[2] };
}

describe('formatFileSize', () => {
  it('formats zero bytes', () => {
    const { value, unit } = parseSize(formatFileSize(0));
    expect(value).toBe(0);
    expect(unit).toBe('B');
  });

  it('keeps bytes for values under a kilobyte', () => {
    const { value, unit } = parseSize(formatFileSize(500));
    expect(value).toBe(500);
    expect(unit).toBe('B');
  });

  it('switches to kilobytes at 1024 bytes', () => {
    const { value, unit } = parseSize(formatFileSize(1024));
    expect(unit).toBe('KB');
    expect(value).toBeCloseTo(1);
  });

  it('formats fractional kilobytes', () => {
    const { value, unit } = parseSize(formatFileSize(1536));
    expect(unit).toBe('KB');
    expect(value).toBeCloseTo(1.5);
  });

  it('formats megabytes', () => {
    const { value, unit } = parseSize(formatFileSize(5 * 1024 * 1024));
    expect(unit).toBe('MB');
    expect(value).toBeCloseTo(5);
  });

  it('formats gigabytes and terabytes', () => {
    const gb = parseSize(formatFileSize(2 * 1024 * 1024 * 1024));
    expect(gb.unit).toBe('GB');
    expect(gb.value).toBeCloseTo(2);

    const tb = parseSize(formatFileSize(3 * 1024 * 1024 * 1024 * 1024));
    expect(tb.unit).toBe('TB');
    expect(tb.value).toBeCloseTo(3);
  });
});

describe('formatTimeAgo', () => {
  const now = Date.now();

  it('formats minutes ago', () => {
    const label = formatTimeAgo(new Date(now - 3 * 60000));
    expect(label.toLowerCase()).toContain('minute');
    expect(label).toContain('3');
    expect(label.toLowerCase()).toContain('ago');
  });

  it('formats hours ago', () => {
    const label = formatTimeAgo(new Date(now - 4 * 3600000));
    expect(label.toLowerCase()).toContain('hour');
    expect(label).toContain('4');
    expect(label.toLowerCase()).toContain('ago');
  });

  it('formats days ago', () => {
    const label = formatTimeAgo(new Date(now - 5 * 86400000));
    expect(label.toLowerCase()).toContain('day');
    expect(label).toContain('5');
    expect(label.toLowerCase()).toContain('ago');
  });
});
