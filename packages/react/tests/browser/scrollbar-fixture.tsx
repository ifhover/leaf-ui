import { BackTop, Button, InfiniteScroll, ScrollArea, Scrollbar } from '@ifhover/leaf-ui';
import { useRef, useState } from 'react';

export function ScrollbarFixture() {
  const [count, setCount] = useState(2);
  const [width, setWidth] = useState(560);
  const [records, setRecords] = useState(8);
  const area = useRef<HTMLDivElement>(null);
  const infinite = useRef<HTMLDivElement>(null);
  return (
    <div style={{ display: 'grid', gap: 32, paddingBottom: 1000 }}>
      <h1>Scrollbar acceptance</h1>
      <Scrollbar
        height={200}
        aria-label="Both axes"
        style={{ width, maxWidth: '100%', background: 'var(--leaf-color-surface-muted)' }}
      >
        <div style={{ width: 900 }}>
          {Array.from({ length: 30 }, (_, index) => (
            <p key={String(index)} style={{ height: 40, margin: 0 }}>
              Record {index + 1}
            </p>
          ))}
        </div>
      </Scrollbar>
      <Button onClick={() => setWidth((previous) => (previous === 560 ? 360 : 560))}>
        Resize container
      </Button>
      <Scrollbar maxHeight={180} aria-label="Dynamic content">
        {Array.from({ length: count }, (_, index) => (
          <div key={String(index)} style={{ height: 40 }}>
            Item {index + 1}
          </div>
        ))}
      </Scrollbar>
      <div style={{ display: 'flex', gap: 12 }}>
        <Button onClick={() => setCount((previous) => previous + 10)}>Add content</Button>
        <Button onClick={() => setCount(2)}>Reset content</Button>
      </div>
      <Scrollbar aria-label="Fits content">
        <p>Short content does not trap wheel scrolling.</p>
      </Scrollbar>
      <Scrollbar height={180} scrollbar="hidden" aria-label="Hidden tracks">
        <div style={{ height: 600 }}>Hidden tracks retain native scrolling.</div>
      </Scrollbar>
      <Scrollbar height={180} scrollbar="always" orientation="vertical" aria-label="Always visible">
        <div style={{ height: 600 }}>Always visible track.</div>
      </Scrollbar>
      <div style={{ height: 300 }}>
        <Scrollbar height="50%" aria-label="Percentage height">
          <div style={{ height: 700 }}>Percentage height resolves against the parent once.</div>
        </Scrollbar>
      </div>
      <div style={{ height: 300 }}>
        <Scrollbar maxHeight="50%" aria-label="Percentage maximum height">
          <div style={{ height: 700 }}>Maximum percentage height.</div>
        </Scrollbar>
      </div>
      <div style={{ direction: 'rtl' }}>
        <Scrollbar orientation="horizontal" aria-label="RTL horizontal" style={{ maxWidth: 560 }}>
          <div style={{ width: 1000, height: 80 }}>RTL content</div>
        </Scrollbar>
      </div>
      <div style={{ position: 'relative' }}>
        <ScrollArea ref={area} height={180} aria-label="BackTop target">
          <div style={{ height: 700 }}>ScrollArea integration</div>
        </ScrollArea>
        <BackTop
          target={() => area.current}
          visibilityHeight={80}
          behavior="auto"
          style={{ position: 'absolute', right: 24, bottom: 24 }}
        >
          Return to top
        </BackTop>
      </div>
      <ScrollArea ref={infinite} height={180} aria-label="Infinite target">
        <InfiniteScroll
          dataLength={records}
          hasMore={records < 16}
          target={() => infinite.current}
          threshold={0}
          onLoadMore={async (signal) => {
            if (!signal.aborted) setRecords((previous) => previous + 4);
          }}
        >
          {Array.from({ length: records }, (_, index) => (
            <div key={String(index)} style={{ height: 40 }}>
              Loaded {index + 1}
            </div>
          ))}
        </InfiniteScroll>
      </ScrollArea>
    </div>
  );
}
