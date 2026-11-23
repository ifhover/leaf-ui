import { CheckboxGroup } from '@ifhover/leaf-ui';

export function CheckboxDescriptions() {
  return (
    <CheckboxGroup
      legend="Notification preferences"
      direction="vertical"
      defaultValue={['security']}
      options={[
        {
          value: 'security',
          label: 'Security alerts',
          description: 'Notify immediately on unusual sign-ins and password changes',
        },
        {
          value: 'digest',
          label: 'Weekly digest',
          description: 'Send a summary of pending tasks every Monday',
        },
        {
          value: 'releases',
          label: 'Release notes',
          description: 'Send announcements only for major releases',
        },
      ]}
    />
  );
}
