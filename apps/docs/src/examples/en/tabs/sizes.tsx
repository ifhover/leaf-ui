import { Grid, ScrollArea, Tabs, Text } from '@ifhover/leaf-ui';
import { Fragment } from 'react';

const items = [
  { key: 'overview', label: 'Overview', children: 'Overview content' },
  { key: 'settings', label: 'Settings', children: 'Settings content' },
];

const sizes = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
] as const;

const appearances = [
  { value: 'line', label: 'Line' },
  { value: 'card', label: 'Card' },
  { value: 'segmented', label: 'Segmented' },
] as const;

export function TabsSizes() {
  return (
    <ScrollArea orientation="horizontal" aria-label="Tab appearance and size comparison">
      <Grid
        columns={4}
        gap={24}
        align="center"
        style={{ gridTemplateColumns: 'max-content repeat(3, minmax(240px, 1fr))' }}
      >
        <span aria-hidden="true" />
        {sizes.map((size) => (
          <Text key={size.value} tone="muted">
            {size.label}
          </Text>
        ))}
        {appearances.map((appearance) => (
          <Fragment key={appearance.value}>
            <Text tone="muted">{appearance.label}</Text>
            {sizes.map((size) => (
              <Tabs
                key={size.value}
                aria-label={`${size.label} ${appearance.label}`}
                size={size.value}
                type={appearance.value}
                items={items}
              />
            ))}
          </Fragment>
        ))}
      </Grid>
    </ScrollArea>
  );
}
