import { Grid, Space, Tabs, Text } from '@ifhover/leaf-ui';

const items = [
  { key: 'overview', label: 'Overview', children: 'View recent project updates.' },
  { key: 'members', label: 'Members', children: 'Manage project members and access.' },
];
const labels = { sm: 'Small', md: 'Default', lg: 'Large' };
const variants = [
  { type: 'line', label: 'Line tabs' },
  { type: 'card', label: 'Card tabs' },
] as const;

export function TabsSizes() {
  return (
    <Grid columns={{ xs: 1, sm: 2 }} gap={24}>
      {variants.map(({ type, label }) => (
        <Space key={type} direction="vertical" align="stretch" size="lg">
          <Text strong>{label}</Text>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Space key={size} direction="vertical" align="stretch" size="sm">
              <span>{labels[size]}</span>
              <Tabs
                aria-label={`${label} · ${labels[size]}`}
                items={items}
                type={type}
                size={size}
              />
            </Space>
          ))}
        </Space>
      ))}
    </Grid>
  );
}
