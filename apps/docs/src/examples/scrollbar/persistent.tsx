import { Flex, Scrollbar, Text } from '@ifhover/leaf-ui';

const tracks = [
  { persistent: false, label: '覆盖内容', name: '覆盖滚动条' },
  { persistent: true, label: '独立占位', name: '占位滚动条' },
] as const;
const options = Array.from({ length: 12 }, (_, index) => index + 1);

export function ScrollbarPersistent() {
  return (
    <Flex direction="column" gap="lg">
      {tracks.map((track) => (
        <Flex key={track.name} direction="column" gap="sm">
          <Text tone="muted">{track.label}</Text>
          <Scrollbar
            persistent={track.persistent}
            scrollbar="always"
            orientation="vertical"
            height={160}
            aria-label={track.name}
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
