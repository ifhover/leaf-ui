import { Button, Card, Flex, Space, Tag } from '@ifhover/leaf-ui';
export function CardSections({ english = false }: { english?: boolean }) {
  const t = (zh: string, en: string) => (english ? en : zh);
  return (
    <Space direction="vertical" align="stretch" size="lg">
      <Card
        title={t('项目概览', 'Project overview')}
        description={t('默认通过留白组织内容', 'Group content with spacing')}
        extra={<Tag>{t('进行中', 'In progress')}</Tag>}
      >
        {t(
          '标题、说明和正文自然分组。',
          'The heading, description and body form natural sections.',
        )}
      </Card>
      <Card
        divided
        title={t('内容分区', 'Content sections')}
        footer={
          <Flex justify="end" gap="sm" wrap>
            <Button variant="outline">{t('取消', 'Cancel')}</Button>
            <Button>{t('确认', 'Confirm')}</Button>
          </Flex>
        }
      >
        {t(
          '设置 divided 后，标题、正文和底部操作使用分隔线划分。',
          'Enable divided to separate the heading, body and footer actions.',
        )}
      </Card>
    </Space>
  );
}
