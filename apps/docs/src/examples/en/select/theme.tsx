import { ConfigProvider, type LeafTheme, Select } from '@sudden3/leaf-ui';

const theme: LeafTheme = {
  primaryColor: '#7654c6',
  borderRadius: 6,
};

export function SelectTheme() {
  return (
    <ConfigProvider className="leaf-demo-stack" theme={theme}>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Themed team</span>
        <Select
          aria-label="Themed team"
          allowClear
          defaultValue="design"
          options={[
            { value: 'design', label: 'Design studio' },
            { value: 'product', label: 'Product team' },
          ]}
        />
      </div>
      <span className="leaf-demo-note">
        Open the list to see its purple theme and border radius.
      </span>
    </ConfigProvider>
  );
}
