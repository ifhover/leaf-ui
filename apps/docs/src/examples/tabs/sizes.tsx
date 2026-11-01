import { ConfigProvider, Grid, ScrollArea, Tabs, Text } from '@ifhover/leaf-ui';
import { Fragment } from 'react';

const items = [
  { key: 'overview', label: '概览', children: '概览内容' },
  { key: 'settings', label: '设置', children: '设置内容' },
];

const sizes = [
  { value: 'sm', label: '小尺寸' },
  { value: 'md', label: '默认尺寸' },
  { value: 'lg', label: '大尺寸' },
] as const;

const appearances = [
  { value: 'line', label: '线形' },
  { value: 'card', label: '卡片' },
  { value: 'segmented', label: '分段' },
] as const;

export function TabsSizes() {
  return (
    <ScrollArea orientation="horizontal" aria-label="标签页样式与尺寸对照">
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
            {sizes.map((size) => {
              const tab = (
                <Tabs
                  aria-label={`${size.label}${appearance.label}`}
                  size={size.value}
                  type={appearance.value}
                  items={items}
                />
              );
              return (
                <Fragment key={size.value}>
                  {size.value === 'sm' && appearance.value === 'segmented' ? (
                    <ConfigProvider theme={{ components: { Tabs: { padding: '2px 3px' } } }}>
                      {tab}
                    </ConfigProvider>
                  ) : (
                    tab
                  )}
                </Fragment>
              );
            })}
          </Fragment>
        ))}
      </Grid>
    </ScrollArea>
  );
}
