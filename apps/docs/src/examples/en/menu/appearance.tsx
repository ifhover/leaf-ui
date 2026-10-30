import { Flex, Menu, Text } from '@ifhover/leaf-ui';

const items = [
  { key: 'home', label: 'Home' },
  { key: 'projects', label: 'Projects' },
  { key: 'settings', label: 'Settings' },
];

const variants = [
  { value: 'neutral', label: 'Neutral' },
  { value: 'raised', label: 'Raised' },
  { value: 'primary', label: 'Primary' },
] as const;

export function MenuAppearance() {
  return (
    <Flex direction="column" gap="lg">
      {variants.map(({ value, label }) => (
        <Flex key={value} direction="column" gap="sm">
          <Text tone="muted">{label}</Text>
          <Menu
            aria-label={`${label} appearance`}
            variant={value}
            defaultSelectedKey="projects"
            items={items}
          />
        </Flex>
      ))}
    </Flex>
  );
}
