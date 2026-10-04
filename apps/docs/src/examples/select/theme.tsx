import { ConfigProvider, type LeafTheme, Select } from '@sudden3/leaf-ui';

const theme: LeafTheme = {
  primaryColor: '#7654c6',
  borderRadius: 6,
};

export function SelectTheme() {
  return (
    <ConfigProvider className="leaf-demo-stack" theme={theme}>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">主题团队</span>
        <Select
          aria-label="主题团队"
          allowClear
          defaultValue="design"
          options={[
            { value: 'design', label: '设计工作室' },
            { value: 'product', label: '产品团队' },
          ]}
        />
      </div>
      <span className="leaf-demo-note">展开选项，浮层会沿用这里的紫色主题与圆角。</span>
    </ConfigProvider>
  );
}
