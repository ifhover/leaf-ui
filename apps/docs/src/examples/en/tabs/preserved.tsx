import { Input, Tabs } from '@ifhover/leaf-ui';

const items = [
  {
    key: 'draft',
    label: 'Draft',
    children: <Input aria-label="Draft content" placeholder="Type here, then switch tabs" />,
  },
  { key: 'preview', label: 'Other content', children: 'Return to Draft to check your input.' },
];

export function TabsPreserved() {
  return <Tabs aria-label="Preserved input state" items={items} />;
}
