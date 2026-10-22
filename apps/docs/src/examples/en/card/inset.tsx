import { Button, Card, Flex, Tag, Text } from '@ifhover/leaf-ui';

export function CardInset() {
  return (
    <Card
      title="Project progress"
      description="This week focuses on component documentation and interaction checks."
      extra={<Tag>In progress</Tag>}
      footer={
        <Flex justify="end">
          <Button variant="outline">View details</Button>
        </Flex>
      }
      variant="inset"
    >
      <Text>
        The heading and status stay on the muted canvas, while the main information sits on a white
        content card.
      </Text>
    </Card>
  );
}
