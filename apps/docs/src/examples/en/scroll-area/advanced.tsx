import { Card, Flex, ScrollArea, Text } from '@ifhover/leaf-ui';

export function ScrollAreaHorizontal() {
  return (
    <ScrollArea orientation="horizontal" aria-label="Horizontal cards">
      <Flex gap="md" style={{ width: 'max-content' }}>
        {['A', 'B', 'C', 'D', 'E'].map((name) => (
          <Card key={name} title={name} style={{ width: 180, flex: 'none' }}>
            <Text>Scroll horizontally</Text>
          </Card>
        ))}
      </Flex>
    </ScrollArea>
  );
}
