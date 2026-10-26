import { Button, Flex, Scrollbar, Text } from '@ifhover/leaf-ui';
import { useRef, useState } from 'react';

export function ScrollbarDynamic() {
  const viewport = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(3);
  const items = Array.from({ length: count }, (_, index) => index + 1);
  return (
    <Flex direction="column" gap="md">
      <Scrollbar ref={viewport} maxHeight={200} aria-label="动态列表">
        <Flex direction="column" gap="md">
          {items.map((item) => (
            <Text key={item}>条目 {item}</Text>
          ))}
        </Flex>
      </Scrollbar>
      <Flex gap="sm" wrap>
        <Button onClick={() => setCount((previous) => previous + 3)}>增加内容</Button>
        <Button onClick={() => viewport.current?.scrollTo({ top: 0, behavior: 'smooth' })}>
          返回顶部
        </Button>
      </Flex>
    </Flex>
  );
}
