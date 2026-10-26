import { Divider, Flex, Text } from '@ifhover/leaf-ui';

const alignments = [
  { align: 'start', label: 'Start' },
  { align: 'center', label: 'Center' },
  { align: 'end', label: 'End' },
] as const;

export function DividerAlignment() {
  return (
    <Flex direction="column" gap="lg">
      {alignments.map(({ align, label }) => (
        <Flex key={align} direction="column" gap="sm">
          <Text tone="muted">{label}</Text>
          <Divider align={align}>Settings</Divider>
        </Flex>
      ))}
    </Flex>
  );
}
