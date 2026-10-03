import { RadioGroup } from '@sudden3/leaf-ui';

export function RadioBasic() {
  return (
    <RadioGroup
      label="选择项目外观"
      name="appearance"
      defaultValue="light"
      options={[
        { label: '浅色', value: 'light' },
        { label: '深色', value: 'dark' },
        { label: '跟随系统', value: 'system' },
        { label: '自定义（暂不可用）', value: 'custom', disabled: true },
      ]}
    />
  );
}
