import { Button, Flex, Scrollbar } from '@ifhover/leaf-ui';
import { useRef, useState } from 'react';
export function ScrollbarDynamic({ english = false }: { english?: boolean }) {
  const viewport = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(3);
  return (
    <Flex direction="column" gap="md">
      <Flex gap="sm" wrap>
        <Button variant="outline" onClick={() => setCount((previous) => previous + 3)}>
          {english ? 'Add items' : '增加内容'}
        </Button>
        <Button
          
          onClick={() => viewport.current?.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          {english ? 'Back to top' : '返回顶部'}
        </Button>
      </Flex>
      <Scrollbar ref={viewport} maxHeight={200} aria-label={english ? 'Dynamic list' : '动态列表'}>
        {Array.from({ length: count }, (_, index) => (
          <div key={String(index)} style={{ padding: '12px 20px' }}>
            {english ? 'Item' : '条目'} {index + 1}
          </div>
        ))}
      </Scrollbar>
    </Flex>
  );
}
