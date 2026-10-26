import { Flex, Result, Text } from '@ifhover/leaf-ui';

export function ResultSizes() {
  return (
    <Flex direction="column" gap="lg">
      <Flex direction="column" gap="sm">
        <Text tone="muted">Small (sm)</Text>
        <Result
          size="sm"
          status="success"
          title="Project created"
          description="You can now add project content."
        />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">Default (md)</Text>
        <Result
          size="md"
          status="success"
          title="Project created"
          description="You can now add project content."
        />
      </Flex>
    </Flex>
  );
}
