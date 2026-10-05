import { version } from 'react';

/** React 18 forwards inert as a string; React 19 recognizes its boolean attribute. */
export function inertAttribute(inactive: boolean): boolean | undefined {
  return (inactive ? (version.startsWith('18.') ? '' : true) : undefined) as boolean | undefined;
}

/** Spread avoids requiring a global React 18 HTMLAttributes augmentation. */
export function inertProps(inactive: boolean) {
  return { inert: inertAttribute(inactive) };
}
