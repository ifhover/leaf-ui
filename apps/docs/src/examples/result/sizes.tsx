import { Flex, Result, Text } from '@ifhover/leaf-ui';

export function ResultSizes() {
  return (
    <Flex direction="column" gap="lg">
      <Flex direction="column" gap="sm">
        <Text tone="muted">小尺寸（sm）</Text>
        <Result
          size="sm"
          status="success"
          title="项目已创建"
          description="现在可以添加项目内容。"
        />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">默认尺寸（md）</Text>
        <Result
          size="md"
          status="success"
          title="项目已创建"
          description="现在可以添加项目内容。"
        />
      </Flex>
    </Flex>
  );
}
