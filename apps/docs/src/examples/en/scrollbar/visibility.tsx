import { Flex, Scrollbar, Text } from '@ifhover/leaf-ui';

const modes = [
  { value: 'auto', label: 'Automatic', name: 'Auto visibility list' },
  { value: 'always', label: 'Always visible', name: 'Always visible list' },
  { value: 'hidden', label: 'Hidden', name: 'Hidden scrollbar list' },
] as const;
const options = Array.from({ length: 12 }, (_, index) => index + 1);

export function ScrollbarVisibility() {
  return (
    <Flex direction="column" gap="lg">
      {modes.map((mode) => (
        <Flex key={mode.value} direction="column" gap="sm">
          <Text tone="muted">{mode.label}</Text>
          <Scrollbar
            orientation="vertical"
            scrollbar={mode.value}
            height={160}
            aria-label={mode.name}
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
