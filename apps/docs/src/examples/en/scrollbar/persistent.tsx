import { Flex, Scrollbar, Text } from '@ifhover/leaf-ui';

const tracks = [
  { persistent: false, label: 'Overlay', name: 'Overlay track' },
  { persistent: true, label: 'Reserved space', name: 'Reserved track' },
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
                <Text key={option}>Option {option}</Text>
              ))}
            </Flex>
          </Scrollbar>
        </Flex>
      ))}
    </Flex>
  );
}
