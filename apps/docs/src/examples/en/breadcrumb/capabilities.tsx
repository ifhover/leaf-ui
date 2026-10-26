import { Breadcrumb } from '@ifhover/leaf-ui';

export function Capabilities() {
  return (
    <Breadcrumb
      aria-label="Collapsed documentation path"
      items={[
        { title: 'Home', href: 'https://ifhover.github.io/leaf-ui/en/' },
        { title: 'Components', href: 'https://ifhover.github.io/leaf-ui/en/components/index.html' },
        { title: 'Breadcrumb', href: '#basic-usage' },
        { title: 'API' },
      ]}
      maxItems={3}
    />
  );
}
