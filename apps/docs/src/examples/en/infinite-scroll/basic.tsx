import { InfiniteScroll, ScrollArea } from '@sudden3/leaf-ui';
import { useRef, useState } from 'react';
export function InfiniteScrollBasic() {
  const root = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState(() => Array.from({ length: 10 }, (_, i) => i));
  return (
    <ScrollArea ref={root} height={240} aria-label="Growing list">
      <InfiniteScroll
        dataLength={items.length}
        hasMore={items.length < 40}
        target={() => root.current}
        onLoadMore={async (signal) => {
          await new Promise((resolve) => setTimeout(resolve, 500));
          if (!signal.aborted)
            setItems((previous) => [
              ...previous,
              ...Array.from({ length: 10 }, (_, index) => previous.length + index),
            ]);
        }}
      >
        {items.map((item) => (
          <div key={item} style={{ padding: '12px 16px' }}>
            Item {item + 1}
          </div>
        ))}
      </InfiniteScroll>
    </ScrollArea>
  );
}
