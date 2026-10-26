import { Input, Tabs } from '@ifhover/leaf-ui';

const items = [
  {
    key: 'draft',
    label: '草稿',
    children: <Input aria-label="草稿内容" placeholder="输入内容后切换标签" />,
  },
  { key: 'preview', label: '其他内容', children: '切回草稿查看输入内容。' },
];

export function TabsPreserved() {
  return <Tabs aria-label="保留输入状态" items={items} />;
}
