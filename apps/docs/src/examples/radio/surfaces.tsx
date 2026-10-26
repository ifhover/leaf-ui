import { RadioGroup } from '@ifhover/leaf-ui';
import { Cloud, HardDrive } from 'lucide-react';
export function RadioCards() {
  return (
    <RadioGroup
      variant="card"
      label={'备份方式'}
      defaultValue="cloud"
      options={[
        {
          value: 'cloud',
          label: '云端备份',
          description: '在你的设备间同步',
          icon: <Cloud />,
        },
        {
          value: 'local',
          label: '本地备份',
          description: '保存在当前设备',
          icon: <HardDrive />,
        },
      ]}
    />
  );
}
