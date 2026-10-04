import { useState } from 'react';

/** Controlled values stay owned by callers; default values initialize local state once. */
export function useControllable<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
) {
  const [internal, setInternal] = useState(defaultValue);
  const current = value === undefined ? internal : value;
  function update(next: T) {
    if (value === undefined) setInternal(next);
    if (!Object.is(current, next)) onChange?.(next);
  }
  return [current, update] as const;
}
