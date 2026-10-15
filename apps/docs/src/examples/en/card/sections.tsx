import { Button, Card, Flex, Space, Tag } from '@ifhover/leaf-ui';
export function CardSections() {
  return (
    <Space direction="vertical" align="stretch" size="lg">
      <Card
        title="Project overview"
        description="Group content with spacing"
        extra={<Tag>In progress</Tag>}
      >
        The heading, description and body form natural sections.
      </Card>
      <Card
        divided
        title="Content sections"
        footer={
          <Flex justify="end" gap="sm" wrap>
            <Button variant="outline">Cancel</Button>
            <Button>Confirm</Button>
          </Flex>
        }
      >
        Enable divided to separate the heading, body and footer actions.
      </Card>
    </Space>
  );
}
