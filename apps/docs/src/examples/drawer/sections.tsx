import { Alert, Button, Drawer, RadioGroup, Space } from '@ifhover/leaf-ui';
import { Bell } from 'lucide-react';
import { useState } from 'react';

export function DrawerSections({ english = false }: { english?: boolean }) {
  const t = (zh: string, en: string) => (english ? en : zh);
  const [open, setOpen] = useState(false);
  const [frequency, setFrequency] = useState('weekly');
  return (
    <>
      <Button variant="outline" startIcon={<Bell />} onClick={() => setOpen(true)}>
        {t('通知偏好', 'Notification preferences')}
      </Button>
      <Drawer
        open={open}
        width={440}
        title={t('通知偏好', 'Notification preferences')}
        description={t('选择适合你的更新频率。', 'Choose the right update frequency for you.')}
        icon={<Bell />}
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t('取消', 'Cancel')}
            </Button>
            <Button onClick={() => setOpen(false)}>{t('保存', 'Save')}</Button>
          </>
        }
      >
        <Space direction="vertical" align="stretch" size={20}>
          <RadioGroup
            variant="list"
            label={t('活动摘要', 'Activity summary')}
            value={frequency}
            onChange={(event) => setFrequency(event.target.value)}
            options={[
              {
                value: 'daily',
                label: t('每日', 'Daily'),
                description: t('每天汇总团队动态', 'A daily team activity digest'),
              },
              {
                value: 'weekly',
                label: t('每周', 'Weekly'),
                description: t('每周一接收一份摘要', 'A summary every Monday'),
              },
              {
                value: 'off',
                label: t('关闭摘要', 'No summary'),
                description: t('仅接收重要提醒', 'Receive only important updates'),
              },
            ]}
          />
          <Alert
            type="info"
            title={t('重要提醒始终发送', 'Important alerts stay enabled')}
            description={t(
              '安全事件和需要你处理的事项不会被关闭。',
              'Security events and actions requiring your attention are always delivered.',
            )}
          />
        </Space>
      </Drawer>
    </>
  );
}
