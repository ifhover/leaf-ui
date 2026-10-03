import { type LeafThemeStyle, Select } from '@leaf-ui/react';

const theme: LeafThemeStyle = {
  '--leaf-color-primary': '#7654c6',
  '--leaf-radius': '6px',
};

export function SelectTheme() {
  return (
    <div className="leaf-demo-stack" style={theme}>
      <Select
        aria-label="主题团队"
        allowClear
        defaultValue="design"
        options={[
          { value: 'design', label: '设计工作室' },
          { value: 'product', label: '产品团队' },
        ]}
      />
      <span className="leaf-demo-note">展开选项，浮层会沿用这里的紫色主题与圆角。</span>
    </div>
  );
}
