import { Empty, Flex, Result } from '@ifhover/leaf-ui';
export function EmptyBasic() {
  return (
    <Flex gap="md" wrap align="start">
      <Result
        status="empty"
        title="暂无项目"
        description="创建第一个项目后，它会出现在这里。"
        size="sm"
      />
      <Empty description="Empty 兼容入口" />
    </Flex>
  );
}
