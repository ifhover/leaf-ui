import { Button, Flex, Text } from '@ifhover/leaf-ui';
import { useEffect, useRef, useState } from 'react';

export function ButtonLoading() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'saved'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function save() {
    clearTimeout(timer.current);
    setStatus('loading');
    // 示例模拟一次异步保存；实际使用时替换成你的业务请求。
    timer.current = setTimeout(() => setStatus('saved'), 1200);
  }

  return (
    <Flex direction="column" gap="md" align="start">
      <Button loading={status === 'loading'} onClick={save}>
        {status === 'saved' ? '再次保存' : '保存更改'}
      </Button>
      <Text tone="muted" role="status">
        {status === 'saved' ? '更改已保存' : '尚未保存'}
      </Text>
    </Flex>
  );
}
