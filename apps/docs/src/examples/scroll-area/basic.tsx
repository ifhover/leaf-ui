import { Flex, ScrollArea, Text } from '@ifhover/leaf-ui';

const items = Array.from({ length: 20 }, (_, index) => index + 1);

export function ScrollAreaBasic() {
  return (
    <ScrollArea height={180} aria-label="项目列表">
      <Flex direction="column" gap="md">
        {items.map((item) => (
          <Text key={item}>项目 {item}</Text>
        ))}
      </Flex>
    </ScrollArea>
  );
}
