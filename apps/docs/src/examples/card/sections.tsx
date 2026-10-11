import { Button, Card, Space, Tag } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function CardSections({ english = false }: { english?: boolean }) {
  const t = (zh: string, en: string) => (english ? en : zh);
  const [saved, setSaved] = useState(false);
  return (
    <Space direction="vertical" align="stretch" style={{ width: '100%' }}>
      <Card
        title={t('团队空间', 'Team workspace')}
        description={t('通过留白组织内容', 'Group content with spacing')}
        extra={<Tag>{t('默认', 'Default')}</Tag>}
      >
        {t(
          '适合展示概览、项目或其他轻量内容。',
          'Use for summaries, projects and lightweight content.',
        )}
      </Card>
      <Card
        divided
        title={t('通知设置', 'Notification settings')}
        description={t('使用分区组织操作', 'Group settings and actions into sections')}
        footer={
          <Space style={{ justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => setSaved(false)}>
              {t('重置', 'Reset')}
            </Button>
            <Button onClick={() => setSaved(true)}>{t('保存', 'Save')}</Button>
          </Space>
        }
      >
        <span role={saved ? 'status' : undefined}>
          {saved
            ? t('设置已保存。', 'Settings saved.')
            : t(
                '接收重要事件提醒，每周汇总一次活动。',
                'Receive important updates and a weekly activity summary.',
              )}
        </span>
      </Card>
    </Space>
  );
}
