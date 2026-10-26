import { CheckboxGroup } from '@ifhover/leaf-ui';
import { HardDrive, Mail, MessageSquare } from 'lucide-react';
export function CheckboxCards() {
  return (
    <CheckboxGroup
      variant="card"
      legend={'Connected services'}
      defaultValue={['mail']}
      options={[
        {
          value: 'mail',
          label: 'Mail',
          description: 'Read and organize messages',
          icon: <Mail />,
        },
        {
          value: 'drive',
          label: 'Cloud drive',
          description: 'Find and organize files',
          icon: <HardDrive />,
        },
        {
          value: 'chat',
          label: 'Team chat',
          description: 'Currently unavailable',
          icon: <MessageSquare />,
          disabled: true,
        },
      ]}
    />
  );
}
