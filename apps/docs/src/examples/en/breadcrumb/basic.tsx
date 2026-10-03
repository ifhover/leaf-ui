import { Breadcrumb, type BreadcrumbItem } from '@sudden3/leaf-ui';
import { House } from 'lucide-react';

const items: readonly BreadcrumbItem[] = [
  { title: 'Home', href: '#basic-usage', icon: <House size={14} /> },
  { title: 'Projects', href: '#basic-usage' },
  { title: 'Leaf Garden' },
];
export function BreadcrumbBasic() {
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <Breadcrumb items={items} />
      <Breadcrumb items={items} separator="/" />
    </div>
  );
}
