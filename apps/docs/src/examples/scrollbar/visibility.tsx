import { Flex, Scrollbar, Text } from '@ifhover/leaf-ui';

const modes = [
  { value: 'auto', label: '自动显示', name: '自动显示列表' },
  { value: 'always', label: '始终显示', name: '始终显示列表' },
  { value: 'hidden', label: '隐藏', name: '隐藏滚动条的列表' },
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
                <Text key={option}>选项 {option}</Text>
              ))}
            </Flex>
          </Scrollbar>
        </Flex>
      ))}
    </Flex>
  );
}
