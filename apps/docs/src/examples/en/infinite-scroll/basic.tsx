import { Flex, InfiniteScroll, ScrollArea, Text } from '@ifhover/leaf-ui';
import { useRef, useState } from 'react';

export function InfiniteScrollBasic() {
  const root = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState(() => Array.from({ length: 10 }, (_, index) => index + 1));

  return (
    <ScrollArea ref={root} height={240} aria-label="Growing list">
      <InfiniteScroll
        dataLength={items.length}
        hasMore={items.length < 40}
        target={() => root.current}
        onLoadMore={async (signal) => {
          await new Promise((resolve) => setTimeout(resolve, 500));
          if (signal.aborted) return;
          setItems((previous) => [
            ...previous,
            ...Array.from({ length: 10 }, (_, index) => previous.length + index + 1),
          ]);
        }}
      >
        <Flex direction="column" gap={16} role="list">
          {items.map((item) => (
            <Text key={item} role="listitem">
              Item {item}
            </Text>
          ))}
        </Flex>
      </InfiniteScroll>
    </ScrollArea>
  );
}
