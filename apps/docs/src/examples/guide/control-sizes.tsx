import { Button, type ControlSize, Input, Select } from '@leaf-ui/react';

export function ControlSizes() {
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      {(['sm', 'md', 'lg'] as const).map((size: ControlSize) => (
        <div key={size} className="leaf-demo-control-row">
          <span className="leaf-demo-size">{size}</span>
          <Input size={size} aria-label={`${size} 搜索`} placeholder="搜索项目" />
          <Select
            size={size}
            aria-label={`${size} 状态`}
            defaultValue="all"
            options={[
              { label: '全部状态', value: 'all' },
              { label: '进行中', value: 'active' },
            ]}
          />
          <Button size={size}>查询</Button>
        </div>
      ))}
    </div>
  );
}
