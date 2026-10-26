import { Affix, Button, Flex, Paragraph, Text } from '@ifhover/leaf-ui';
import { useCallback, useRef, useState } from 'react';

export function AnchorAffix() {
  const scroll = useRef<HTMLElement>(null);
  const container = useCallback(() => scroll.current ?? window, []);
  const [saved, setSaved] = useState(false);

  return (
    <section
      ref={scroll}
      aria-label="Scrollable content"
      // biome-ignore lint/a11y/noNoninteractiveTabindex: The scroll region needs keyboard focus.
      tabIndex={0}
      style={{ height: 200, overflow: 'auto' }}
    >
      <Flex direction="column" gap={16}>
        <Paragraph>Scroll down to keep the save action at the top of this area.</Paragraph>
        <Affix container={container} offsetTop={8}>
          <Flex direction="column" align="start" gap={8}>
            <Button onClick={() => setSaved(true)}>Save changes</Button>
            <Text tone="muted" role="status">
              {saved ? 'Changes saved' : 'Not saved yet'}
            </Text>
          </Flex>
        </Affix>
        <section style={{ minHeight: 360 }}>
          <Paragraph>More project content continues in this scroll area.</Paragraph>
        </section>
        <Paragraph>End of content.</Paragraph>
      </Flex>
    </section>
  );
}
