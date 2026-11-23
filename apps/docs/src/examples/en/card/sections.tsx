import { Button, Card, Space, Tag } from '@ifhover/leaf-ui';
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
        title="Content sections"
        footer={
          <>
            <Button variant="outline">Cancel</Button>
            <Button variant="solid">Confirm</Button>
          </>
        }
      >
        The heading, body and footer actions follow the shared dialog spacing and divider.
      </Card>
    </Space>
  );
}
