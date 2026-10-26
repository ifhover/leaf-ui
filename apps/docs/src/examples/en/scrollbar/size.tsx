import { Flex, Scrollbar, Text } from '@ifhover/leaf-ui';

const sizes = [
  { size: 'md', label: 'Default', name: 'Options, md' },
  { size: 'sm', label: 'Small', name: 'Options, sm' },
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
                <Text key={option}>Option {option}</Text>
              ))}
            </Flex>
          </Scrollbar>
        </Flex>
      ))}
    </Flex>
  );
}
