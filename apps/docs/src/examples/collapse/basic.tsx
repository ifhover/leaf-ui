import { Collapse, type CollapseItem, Input, Space } from '@ifhover/leaf-ui';

const items: CollapseItem[] = [
  { key: 'about', label: '项目介绍', children: <p>Leaf Garden 的项目信息。</p> },
  {
    key: 'settings',
    label: '设置',
    children: <Input aria-label="项目名称" placeholder="输入后折叠，内容会保留" />,
  },
  { key: 'archived', label: '已归档', children: null, disabled: true },
];
export function CollapseBasic() {
  return (
    <Space direction="vertical" align="stretch" className="leaf-demo-stack leaf-demo-stack--wide">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">自由展开</span>
        <Collapse items={items} defaultActiveKey="about" />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">手风琴 · 紧凑尺寸</span>
        <Collapse items={items} accordion size="sm" />
      </div>
    </Space>
  );
}
