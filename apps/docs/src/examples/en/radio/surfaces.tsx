import { RadioGroup } from '@ifhover/leaf-ui';
import { Cloud, HardDrive } from 'lucide-react';
export function RadioCards() {
  return (
    <RadioGroup
      variant="card"
      label={'Backup method'}
      defaultValue="cloud"
      options={[
        {
          value: 'cloud',
          label: 'Cloud backup',
          description: 'Sync across your devices',
          icon: <Cloud />,
        },
        {
          value: 'local',
          label: 'Local backup',
          description: 'Keep data on this device',
          icon: <HardDrive />,
        },
      ]}
    />
  );
}
