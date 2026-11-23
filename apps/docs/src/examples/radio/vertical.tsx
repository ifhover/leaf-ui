import { RadioGroup } from '@ifhover/leaf-ui';

export function RadioVertical() {
  return (
    <RadioGroup
      label="提醒频率"
      direction="vertical"
      defaultValue="daily"
      options={[
        { label: '每天', value: 'daily', description: '每日发送未读动态汇总' },
        { label: '每周', value: 'weekly', description: '每周一早晨发送项目周报' },
        { label: '仅重要消息', value: 'important', description: '仅在提及或审批时发送提醒' },
      ]}
    />
  );
}
