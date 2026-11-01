import { ConfigProvider, Grid, Space, Tabs, Text } from '@ifhover/leaf-ui';

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
    <Space direction="vertical" align="stretch" size="lg">
      {sizes.map((size) => (
        <Space key={size.value} direction="vertical" align="stretch" size="sm">
          <Text tone="muted">{size.label}</Text>
          <Grid columns={{ xs: 1, sm: 3 }} gap={16} align="start">
            {appearances.map((appearance) => {
              const tab = (
                <Tabs
                  aria-label={`${size.label} ${appearance.label}`}
                  size={size.value}
                  type={appearance.value}
                  items={items}
                />
              );
              return (
                <Space key={appearance.value} direction="vertical" align="stretch" size="sm">
                  <Text tone="muted">{appearance.label}</Text>
                  {size.value === 'sm' && appearance.value === 'segmented' ? (
                    <ConfigProvider theme={{ components: { Tabs: { padding: '2px 3px' } } }}>
                      {tab}
                    </ConfigProvider>
                  ) : (
                    tab
                  )}
                </Space>
              );
            })}
          </Grid>
        </Space>
      ))}
    </Space>
  );
}
