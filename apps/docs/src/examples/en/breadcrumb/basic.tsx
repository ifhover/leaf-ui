import { Breadcrumb } from '@ifhover/leaf-ui';

export function BreadcrumbBasic() {
  return (
    <Breadcrumb
      items={[
        { title: 'Home', href: 'https://ifhover.github.io/leaf-ui/en/' },
        { title: 'Components', href: 'https://ifhover.github.io/leaf-ui/en/components/index.html' },
        { title: 'Breadcrumb' },
      ]}
    />
  );
}
