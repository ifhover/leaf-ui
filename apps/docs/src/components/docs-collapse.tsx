import { Collapse } from '@ifhover/leaf-ui';
import type { ReactNode } from 'react';

export function DocsCollapse({ title, children }: { title: string; children: ReactNode }) {
  // Include the prose in Markdown exports before the browser opens the panel.
  if (process.env.__SSR_MD__) {
    return (
      <section>
        <p>{title}</p>
        {children}
      </section>
    );
  }
  return <Collapse aria-label={title} items={[{ key: 'content', label: title, children }]} />;
}
