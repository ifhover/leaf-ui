import { RadioGroup } from '@ifhover/leaf-ui';
import { Cloud, HardDrive } from 'lucide-react';
export function RadioCards({ english = false }: { english?: boolean }) {
  const t = (zh: string, en: string) => (english ? en : zh);
  return (
    <RadioGroup
      variant="card"
      label={t('备份方式', 'Backup method')}
      defaultValue="cloud"
      options={[
        {
          value: 'cloud',
          label: t('云端备份', 'Cloud backup'),
          description: t('在你的设备间同步', 'Sync across your devices'),
          icon: <Cloud />,
        },
        {
          value: 'local',
          label: t('本地备份', 'Local backup'),
          description: t('保存在当前设备', 'Keep data on this device'),
          icon: <HardDrive />,
        },
      ]}
    />
  );
}
