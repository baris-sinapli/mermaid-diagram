import { afterEach, describe, expect, it, vi } from 'vitest';

import { debounce } from './debounce';

type Callable = (...args: unknown[]) => void;

describe('debounce', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('delays the first invocation by the requested amount', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 100) as unknown as Callable;

    debounced('a');

    vi.advanceTimersByTime(99);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('a');
  });

  it('calls only once and uses the latest arguments for rapid calls', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 100) as unknown as Callable;

    debounced('first');
    debounced('second');
    debounced('third');

    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('third');
  });

  it('invokes after the default delay', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn) as unknown as Callable;

    debounced('default');

    vi.advanceTimersByTime(60000);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('default');
  });
});
