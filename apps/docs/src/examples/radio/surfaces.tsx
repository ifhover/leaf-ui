import { RadioGroup, Tag } from '@ifhover/leaf-ui';
import { Cloud, HardDrive, ShieldCheck } from 'lucide-react';

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

export function RadioList({ english = false }: { english?: boolean }) {
  const t = (zh: string, en: string) => (english ? en : zh);
  return (
    <RadioGroup
      variant="list"
      label={t('访问策略', 'Access policy')}
      defaultValue="readonly"
      options={[
        {
          value: 'readonly',
          label: t('只读访问', 'Read-only access'),
          description: t(
            '允许读取，保留变更审批',
            'Allow reading and require approval for changes',
          ),
          icon: <ShieldCheck />,
          extra: (
            <Tag color="success" size="sm">
              {t('推荐', 'Recommended')}
            </Tag>
          ),
        },
        {
          value: 'review',
          label: t('每次审批', 'Approve every request'),
          description: t('每次操作都由负责人确认', 'Ask the owner to approve every action'),
        },
      ]}
    />
  );
}
