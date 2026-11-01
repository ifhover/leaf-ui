import { ConfigProvider, Grid, Space, Tabs, Text } from '@ifhover/leaf-ui';

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
    <Space direction="vertical" align="stretch" size="lg">
      {sizes.map((size) => (
        <Space key={size.value} direction="vertical" align="stretch" size="sm">
          <Text tone="muted">{size.label}</Text>
          <Grid columns={{ xs: 1, sm: 3 }} gap={16} align="start">
            {appearances.map((appearance) => {
              const tab = (
                <Tabs
                  aria-label={`${size.label}${appearance.label}`}
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
