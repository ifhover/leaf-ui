import { type LeafThemeStyle, Select } from '@sudden3/leaf-ui';

const theme: LeafThemeStyle = {
  '--leaf-color-primary': '#7654c6',
  '--leaf-radius': '6px',
};

export function SelectTheme() {
  return (
    <div className="leaf-demo-stack" style={theme}>
      <Select
        aria-label="Themed team"
        allowClear
        defaultValue="design"
        options={[
          { value: 'design', label: 'Design studio' },
          { value: 'product', label: 'Product team' },
        ]}
      />
      <span className="leaf-demo-note">
        Open the list to see its purple theme and border radius.
      </span>
    </div>
  );
}
