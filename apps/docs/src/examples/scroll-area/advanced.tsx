import { Card, Flex, ScrollArea, Text } from '@ifhover/leaf-ui';

export function ScrollAreaHorizontal() {
  return (
    <ScrollArea orientation="horizontal" aria-label="横向卡片">
      <Flex gap="md" style={{ width: 'max-content' }}>
        {['A', 'B', 'C', 'D', 'E'].map((name) => (
          <Card key={name} title={name} style={{ width: 180, flex: 'none' }}>
            <Text>横向浏览内容</Text>
          </Card>
        ))}
      </Flex>
    </ScrollArea>
  );
}
