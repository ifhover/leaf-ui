import { Select } from '@sudden3/leaf-ui';

const options = [
  { label: '设计工作室', value: 'design' },
  { label: '产品团队', value: 'product' },
  { label: '工程团队', value: 'engineering' },
  { label: '归档项目', value: 'archived', disabled: true },
];

export function SelectBasic() {
  return (
    <div className="leaf-demo-stack">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">选择团队</span>
        <Select aria-label="选择团队" options={options} placeholder="请选择团队" />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">默认团队</span>
        <Select aria-label="默认团队" options={options} defaultValue="design" />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">禁用团队</span>
        <Select aria-label="禁用团队" options={options} disabled defaultValue="product" />
      </div>
    </div>
  );
}
