import { Empty, Flex, Result } from '@ifhover/leaf-ui';
export function EmptyBasic() {
  return (
    <Flex gap="md" wrap align="start">
      <Result
        status="empty"
        title="No projects yet"
        description="Create your first project and it will show up here."
        size="sm"
      />
      <Empty description="Empty compatibility entry" />
    </Flex>
  );
}
