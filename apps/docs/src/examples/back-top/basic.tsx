import { BackTop, ScrollArea } from '@sudden3/leaf-ui';
import { useRef } from 'react';
export function BackTopBasic() {
  const root = useRef<HTMLDivElement>(null);
  return (
    <div style={{ position: 'relative' }}>
      <ScrollArea ref={root} height={200} aria-label="演示滚动区域">
        {Array.from({ length: 18 }, (_, i) => (
          <p key={String(i)} style={{ padding: '4px 16px' }}>
            向下滚动后，右下角显示返回按钮。 {i + 1}
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
