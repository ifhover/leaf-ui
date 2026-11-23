import { CheckboxGroup } from '@ifhover/leaf-ui';

export function CheckboxDescriptions() {
  return (
    <CheckboxGroup
      legend="通知偏好"
      direction="vertical"
      defaultValue={['security']}
      options={[
        {
          value: 'security',
          label: '安全提醒',
          description: '异常登录与密码变更时立即通知',
        },
        {
          value: 'digest',
          label: '项目周报',
          description: '每周一发送待办与进度摘要',
        },
        {
          value: 'releases',
          label: '版本更新',
          description: '仅在发布重要功能时发送公告',
        },
      ]}
    />
  );
}
