import { Flex, Scrollbar, Text } from '@ifhover/leaf-ui';

const items = Array.from({ length: 12 }, (_, index) => index + 1);

export function ScrollbarBasic() {
  return (
    <Scrollbar height={200} aria-label="Project activity">
      <Flex direction="column" gap="md">
        {items.map((item) => (
          <Text key={item}>Project activity {item}</Text>
        ))}
      </Flex>
    </Scrollbar>
  );
}
