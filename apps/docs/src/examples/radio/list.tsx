import { RadioGroup, Tag } from '@ifhover/leaf-ui';
import { ShieldCheck } from 'lucide-react';
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
