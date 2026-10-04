import { BackTop, ScrollArea } from '@sudden3/leaf-ui';
import { useRef } from 'react';
export function BackTopBasic() {
  const root = useRef<HTMLDivElement>(null);
  return (
    <div style={{ position: 'relative' }}>
      <ScrollArea ref={root} height={200} aria-label="Demo scroll area">
        {Array.from({ length: 18 }, (_, i) => (
          <p key={String(i)} style={{ padding: '4px 16px' }}>
            Scroll down to show the back-to-top button. {i + 1}
          </p>
        ))}
      </ScrollArea>
      <BackTop
        target={() => root.current}
        visibilityHeight={100}
        style={{ position: 'absolute', right: 16, bottom: 16 }}
      />
    </div>
  );
}
