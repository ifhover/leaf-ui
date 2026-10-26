import { Flex, Scrollbar, Text } from '@ifhover/leaf-ui';

const sizes = [
  { size: 'md', label: '默认', name: '选项，md' },
  { size: 'sm', label: '小号', name: '选项，sm' },
] as const;
const options = Array.from({ length: 12 }, (_, index) => index + 1);

export function ScrollbarSize() {
  return (
    <Flex direction="column" gap="lg">
      {sizes.map(({ size, label, name }) => (
        <Flex key={size} direction="column" gap="sm">
          <Text tone="muted">{label}</Text>
          <Scrollbar
            size={size}
            height={160}
            scrollbar="always"
            orientation="vertical"
            aria-label={name}
          >
            <Flex direction="column" gap="sm">
              {options.map((option) => (
                <Text key={option}>选项 {option}</Text>
              ))}
            </Flex>
          </Scrollbar>
        </Flex>
      ))}
    </Flex>
  );
}
