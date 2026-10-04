import { BackTop, ScrollArea } from '@sudden3/leaf-ui';
import { useRef } from 'react';
export function BackTopCustom() {
  const root = useRef<HTMLDivElement>(null);
  return (
    <div style={{ position: 'relative' }}>
      <ScrollArea ref={root} height={180} aria-label="Custom back-to-top button">
        <div style={{ height: 620, padding: 16 }}>Scroll to reveal the button.</div>
      </ScrollArea>
      <BackTop
        target={() => root.current}
        visibilityHeight={80}
        behavior="auto"
        style={{ position: 'absolute', right: 16, bottom: 16 }}
      >
        Top
      </BackTop>
    </div>
  );
}
