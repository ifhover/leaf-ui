import { Flex, InfiniteScroll, ScrollArea, Text } from '@ifhover/leaf-ui';
import { useRef, useState } from 'react';

export function InfiniteScrollRetry() {
  const root = useRef<HTMLDivElement>(null);
  const attempt = useRef(0);
  const [items, setItems] = useState([1, 2, 3, 4, 5, 6]);

  return (
    <ScrollArea ref={root} height={240} aria-label="可重试列表">
      <InfiniteScroll
        dataLength={items.length}
        hasMore={items.length < 12}
        target={() => root.current}
        onLoadMore={async (signal) => {
          await new Promise((resolve) => setTimeout(resolve, 300));
          if (signal.aborted) return;
          if (attempt.current++ === 0) throw new Error('Retry demo');
          setItems((previous) => [...previous, 7, 8, 9, 10, 11, 12]);
        }}
      >
        <Flex direction="column" gap={16} role="list">
          {items.map((item) => (
            <Text key={item} role="listitem">
              记录 {item}
            </Text>
          ))}
        </Flex>
      </InfiniteScroll>
    </ScrollArea>
  );
}
