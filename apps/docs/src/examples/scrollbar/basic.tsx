import { Flex, Scrollbar, Text } from '@ifhover/leaf-ui';

const items = Array.from({ length: 12 }, (_, index) => index + 1);

export function ScrollbarBasic() {
  return (
    <Scrollbar height={200} aria-label="项目动态">
      <Flex direction="column" gap="md">
        {items.map((item) => (
          <Text key={item}>项目动态 {item}</Text>
        ))}
      </Flex>
    </Scrollbar>
  );
}
