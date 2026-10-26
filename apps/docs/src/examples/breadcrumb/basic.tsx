import { Breadcrumb } from '@ifhover/leaf-ui';

export function BreadcrumbBasic() {
  return (
    <Breadcrumb
      items={[
        { title: '首页', href: 'https://ifhover.github.io/leaf-ui/' },
        { title: '组件', href: 'https://ifhover.github.io/leaf-ui/components/index.html' },
        { title: 'Breadcrumb' },
      ]}
    />
  );
}
