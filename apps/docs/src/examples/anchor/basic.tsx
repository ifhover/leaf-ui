import { Anchor } from '@ifhover/leaf-ui';
import { useCallback, useId, useRef } from 'react';
export function AnchorBasic({ english = false }: { english?: boolean }) {
  const scroll = useRef<HTMLDivElement>(null),
    id = useId();
  const container = useCallback(() => scroll.current ?? window, []);
  const sections = [
    english ? 'Overview' : '概况',
    english ? 'Members' : '成员',
    english ? 'Settings' : '设置',
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '120px minmax(0, 1fr)', gap: 20 }}>
      <Anchor
        container={container}
        items={sections.map((title, index) => ({ key: title, title, href: `#${id}-${index}` }))}
      />
      <div ref={scroll} style={{ height: 240, overflow: 'auto' }}>
        {sections.map((title, index) => (
          <section key={title} id={`${id}-${index}`} style={{ minHeight: 210 }}>
            <h3>{title}</h3>
            <p>
              {english
                ? 'Scroll this area or select an item in the contents.'
                : '滚动这一块内容，或点击左侧的目录。'}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
