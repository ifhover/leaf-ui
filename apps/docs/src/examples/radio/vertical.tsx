import { RadioGroup } from '@ifhover/leaf-ui';

export function RadioVertical() {
  return (
    <RadioGroup
      label="提醒频率"
      direction="vertical"
      defaultValue="daily"
      options={[
        { label: '每天', value: 'daily' },
        { label: '每周', value: 'weekly' },
        { label: '仅重要消息', value: 'important' },
      ]}
    />
  );
}
