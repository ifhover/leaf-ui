import { Alert, Flex, Text } from '@ifhover/leaf-ui';

export function AlertTypes() {
  return (
    <Flex direction="column" gap="lg">
      <Flex direction="column" gap="sm">
        <Text tone="muted">Information</Text>
        <Alert type="info" title="A new version is available" />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">Success</Text>
        <Alert type="success" title="Project saved" />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">Warning</Text>
        <Alert type="warning" title="Storage is almost full" />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">Danger</Text>
        <Alert type="danger" title="Save failed. Try again later." />
      </Flex>
    </Flex>
  );
}
