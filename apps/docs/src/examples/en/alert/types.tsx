import { Alert, Flex, Text } from '@ifhover/leaf-ui';

export function AlertTypes() {
  return (
    <Flex direction="column" gap="lg">
      <Flex direction="column" gap="sm">
        <Text tone="muted">Default</Text>
        <Alert
          title="A new version is available"
          description="Refresh the page to switch to the latest version."
        />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">Success</Text>
        <Alert
          type="success"
          title="Project saved"
          description="All changes have been synced to your workspace."
        />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">Warning</Text>
        <Alert
          type="warning"
          title="Storage is almost full"
          description="Less than 10% space remains. Clean up old attachments soon."
        />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">Danger</Text>
        <Alert
          type="danger"
          title="Save failed. Try again later."
          description="The network connection was interrupted before your changes were saved."
        />
      </Flex>
    </Flex>
  );
}
