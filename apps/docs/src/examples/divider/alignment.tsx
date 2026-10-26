import { Divider, Flex, Text } from '@ifhover/leaf-ui';

const alignments = [
  { align: 'start', label: '起始' },
  { align: 'center', label: '居中' },
  { align: 'end', label: '末尾' },
] as const;

export function DividerAlignment() {
  return (
    <Flex direction="column" gap="lg">
      {alignments.map(({ align, label }) => (
        <Flex key={align} direction="column" gap="sm">
          <Text tone="muted">{label}</Text>
          <Divider align={align}>设置</Divider>
        </Flex>
      ))}
    </Flex>
  );
}
