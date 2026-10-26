import { Affix, Button, Flex, Paragraph, Text } from '@ifhover/leaf-ui';
import { useCallback, useRef, useState } from 'react';

export function AnchorAffix() {
  const scroll = useRef<HTMLElement>(null);
  const container = useCallback(() => scroll.current ?? window, []);
  const [saved, setSaved] = useState(false);

  return (
    <section
      ref={scroll}
      aria-label="可滚动的内容"
      // biome-ignore lint/a11y/noNoninteractiveTabindex: The scroll region needs keyboard focus.
      tabIndex={0}
      style={{ height: 200, overflow: 'auto' }}
    >
      <Flex direction="column" gap={16}>
        <Paragraph>向下滚动，保存按钮会固定在这块内容的顶部。</Paragraph>
        <Affix container={container} offsetTop={8}>
          <Flex direction="column" align="start" gap={8}>
            <Button onClick={() => setSaved(true)}>保存修改</Button>
            <Text tone="muted" role="status">
              {saved ? '修改已保存' : '尚未保存'}
            </Text>
          </Flex>
        </Affix>
        <section style={{ minHeight: 360 }}>
          <Paragraph>这里是可继续滚动的项目内容。</Paragraph>
        </section>
        <Paragraph>内容结束。</Paragraph>
      </Flex>
    </section>
  );
}
