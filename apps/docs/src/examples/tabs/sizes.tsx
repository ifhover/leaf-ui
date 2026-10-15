import { Grid, Space, Tabs, Text } from '@ifhover/leaf-ui';

const items = [
  { key: 'overview', label: '概览', children: '查看项目的最近更新。' },
  { key: 'members', label: '成员', children: '管理项目成员和访问权限。' },
];
const labels = { sm: '小尺寸', md: '默认尺寸', lg: '大尺寸' };
const variants = [
  { type: 'line', label: '线形标签' },
  { type: 'card', label: '卡片标签' },
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
