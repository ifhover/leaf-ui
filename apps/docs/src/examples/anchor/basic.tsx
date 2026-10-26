import { Anchor, Flex, Grid, Paragraph, Title } from '@ifhover/leaf-ui';
import { useCallback, useId, useRef } from 'react';

export function AnchorBasic() {
  const scroll = useRef<HTMLElement>(null);
  const id = useId();
  const container = useCallback(() => scroll.current ?? window, []);
  const sections = [
    { key: 'overview', title: '概况', description: '查看项目的基本信息。' },
    { key: 'members', title: '成员', description: '管理参与项目的成员。' },
    { key: 'settings', title: '设置', description: '调整项目的通知设置。' },
  ];

  return (
    <Grid columns={{ xs: 1, sm: 2 }} gap={16} align="start">
      <Anchor
        aria-label="章节目录"
        container={container}
        items={sections.map(({ key, title }) => ({ key, title, href: `#${id}-${key}` }))}
      />
      <section
        ref={scroll}
        aria-label="章节内容"
        // biome-ignore lint/a11y/noNoninteractiveTabindex: The scroll region needs keyboard focus.
        tabIndex={0}
        style={{ height: 240, overflow: 'auto' }}
      >
        {sections.map(({ key, title, description }) => (
          <section key={key} id={`${id}-${key}`} style={{ minHeight: 210 }}>
            <Flex direction="column" gap={8}>
              <Title level={4}>{title}</Title>
              <Paragraph>{description}</Paragraph>
            </Flex>
          </section>
        ))}
      </section>
    </Grid>
  );
}
