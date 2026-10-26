import { Anchor, Flex, Grid, Paragraph, Title } from '@ifhover/leaf-ui';
import { useCallback, useId, useRef } from 'react';

export function AnchorBasic() {
  const scroll = useRef<HTMLElement>(null);
  const id = useId();
  const container = useCallback(() => scroll.current ?? window, []);
  const sections = [
    { key: 'overview', title: 'Overview', description: 'View basic project information.' },
    { key: 'members', title: 'Members', description: 'Manage the people in this project.' },
    { key: 'settings', title: 'Settings', description: 'Adjust project notifications.' },
  ];

  return (
    <Grid columns={{ xs: 1, sm: 2 }} gap={16} align="start">
      <Anchor
        aria-label="Section contents"
        container={container}
        items={sections.map(({ key, title }) => ({ key, title, href: `#${id}-${key}` }))}
      />
      <section
        ref={scroll}
        aria-label="Section content"
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
