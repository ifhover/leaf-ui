import { Collapse, type CollapseItem, Input } from '@sudden3/leaf-ui';

const items: CollapseItem[] = [
  { key: 'about', label: 'About the project', children: <p>About Leaf Garden.</p> },
  {
    key: 'settings',
    label: 'Settings',
    children: (
      <Input aria-label="Project name" placeholder="Type a draft, then collapse to keep it" />
    ),
  },
  { key: 'archived', label: 'Archived', children: null, disabled: true },
];
export function CollapseBasic() {
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <Collapse items={items} defaultActiveKey="about" />
      <Collapse items={items} accordion size="sm" />
    </div>
  );
}
