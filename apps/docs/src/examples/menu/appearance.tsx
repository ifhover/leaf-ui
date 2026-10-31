import { Flex, Menu, Text } from '@ifhover/leaf-ui';

const items = [
  { key: 'home', label: '首页' },
  { key: 'projects', label: '项目' },
  { key: 'settings', label: '设置' },
];

const variants = [
  { value: 'primary', label: '主题色（默认）' },
  { value: 'neutral', label: '中性' },
  { value: 'raised', label: '浮起' },
] as const;

export function MenuAppearance() {
  return (
    <Flex direction="column" gap="lg">
      {variants.map(({ value, label }) => (
        <Flex key={value} direction="column" gap="sm">
          <Text tone="muted">{label}</Text>
          <Menu
            aria-label={`${label}外观`}
            variant={value}
            defaultSelectedKey="projects"
            items={items}
          />
        </Flex>
      ))}
    </Flex>
  );
}
