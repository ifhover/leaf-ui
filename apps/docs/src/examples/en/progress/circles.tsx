import { Flex, Progress, Text } from '@ifhover/leaf-ui';
export function ProgressCircles() {
  return (
    <Flex gap="md" align="center" wrap justify="center">
      <Flex direction="column" gap="sm" align="start">
        <Text>In progress</Text>
        <Progress percent={45} type="circle" size={80} />
      </Flex>
      <Flex direction="column" gap="sm" align="start">
        <Text>Complete</Text>
        <Progress percent={100} type="circle" size={80} />
      </Flex>
      <Flex direction="column" gap="sm" align="start">
        <Text>Failed</Text>
        <Progress percent={60} type="circle" status="error" size={80} />
      </Flex>
    </Flex>
  );
}
