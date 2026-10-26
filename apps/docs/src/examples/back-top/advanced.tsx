import { BackTop, Paragraph, ScrollArea } from '@ifhover/leaf-ui';
import { useRef } from 'react';

export function BackTopCustom() {
  const viewport = useRef<HTMLDivElement>(null);
  return (
    <div style={{ position: 'relative' }}>
      <ScrollArea ref={viewport} height={200} aria-label="演示滚动区域">
        {Array.from({ length: 12 }, (_, index) => (
          <Paragraph key={String(index)}>滚动内容 {index + 1}</Paragraph>
        ))}
      </ScrollArea>
      <BackTop
        target={() => viewport.current}
        visibilityHeight={100}
        style={{ position: 'absolute', left: 16, bottom: 16 }}
      />
    </div>
  );
}
