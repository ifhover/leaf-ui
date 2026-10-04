import { Collapse, type CollapseItem, Input } from '@sudden3/leaf-ui';

const items: CollapseItem[] = [
  { key: 'about', label: 'About the project', children: <p>About Leaf Garden.</p> },
  {
    key: 'settings',
    label: 'Settings',
    children: (
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Project name</span>
        <Input aria-label="Project name" placeholder="Type a draft, then collapse to keep it" />
      </div>
    ),
  },
  { key: 'archived', label: 'Archived', children: null, disabled: true },
];
export function CollapseBasic() {
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Expand freely</span>
        <Collapse items={items} defaultActiveKey="about" />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Accordion · Compact</span>
        <Collapse items={items} accordion size="sm" />
      </div>
    </div>
  );
}
