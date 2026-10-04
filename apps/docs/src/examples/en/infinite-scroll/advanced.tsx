import { InfiniteScroll, ScrollArea } from '@sudden3/leaf-ui';
import { useRef, useState } from 'react';
export function InfiniteScrollRetry() {
  const root = useRef<HTMLDivElement>(null);
  const attempt = useRef(0);
  const [items, setItems] = useState([0, 1, 2, 3, 4, 5]);
  return (
    <ScrollArea ref={root} height={180} aria-label="Retry example">
      <InfiniteScroll
        dataLength={items.length}
        hasMore={items.length < 12}
        target={() => root.current}
        onLoadMore={async (signal) => {
          await new Promise((resolve) => setTimeout(resolve, 300));
          if (signal.aborted) return;
          if (attempt.current++ === 0) throw new Error('Retry demo');
          setItems((previous) => [...previous, ...[6, 7, 8, 9, 10, 11]]);
        }}
      >
        {items.map((item) => (
          <p key={item}>Record {item + 1}</p>
        ))}
      </InfiniteScroll>
    </ScrollArea>
  );
}
