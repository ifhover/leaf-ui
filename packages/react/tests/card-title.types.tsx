import { createRef } from 'react';
import { CardTitle, type CardTitleProps, type LeafComponentDefaults } from '../src';
import { CardTitle as SubpathCardTitle } from '../src/card';

export function cardTitleTypeContracts() {
  const ref = createRef<HTMLHeadingElement>();
  const props: CardTitleProps = {
    level: 2,
    size: 'sm',
    description: 'Supporting text',
    extra: 'Action',
    containerProps: { id: 'title-region', className: 'region' },
    children: 'Section',
  };
  const root = <CardTitle {...props} ref={ref} />;
  const subpath = <SubpathCardTitle level={6} size="lg" ref={ref} />;
  const defaults: LeafComponentDefaults = { CardTitle: { level: 2, size: 'sm' } };
  // @ts-expect-error Heading levels use the native h1 through h6 range.
  const invalidLevel = <CardTitle level={7} />;
  // @ts-expect-error Visual sizes match the Card sizes.
  const invalidSize = <CardTitle size="xl" />;
  // @ts-expect-error CardTitle forwards a heading element, not a button.
  const invalidRef = <CardTitle ref={createRef<HTMLButtonElement>()} />;
  // @ts-expect-error Regional defaults share the same heading level contract.
  const invalidDefaults: LeafComponentDefaults = { CardTitle: { level: 0 } };
  return { root, subpath, defaults, invalidLevel, invalidSize, invalidRef, invalidDefaults };
}
