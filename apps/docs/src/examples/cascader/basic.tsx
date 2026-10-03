import { Cascader } from '@sudden3/leaf-ui';

const options = [
  {
    value: 'design',
    label: '设计',
    children: [
      { value: 'interface', label: '界面设计' },
      { value: 'brand', label: '品牌设计' },
    ],
  },
  {
    value: 'engineering',
    label: '工程',
    children: [
      { value: 'frontend', label: '前端开发' },
      { value: 'backend', label: '后端开发' },
    ],
  },
  { value: 'archived', label: '归档分类', disabled: true },
];

export function CascaderBasic() {
  return (
    <div className="leaf-demo-stack">
      <Cascader aria-label="项目分类" options={options} placeholder="选择项目分类" />
      <Cascader aria-label="默认分类" options={options} defaultValue={['design', 'interface']} />
      <Cascader aria-label="禁用分类" options={options} disabled />
    </div>
  );
}
