import { Flex, Grid, Pagination, Text } from '@ifhover/leaf-ui';

export function PaginationSizes() {
  return (
    <Grid columns={1} gap={16}>
      <Flex direction="column" gap={8}>
        <Text tone="muted">小</Text>
        <Pagination aria-label="小尺寸分页" total={30} defaultCurrent={2} size="sm" />
      </Flex>
      <Flex direction="column" gap={8}>
        <Text tone="muted">中（默认）</Text>
        <Pagination aria-label="中尺寸分页" total={30} defaultCurrent={2} size="md" />
      </Flex>
      <Flex direction="column" gap={8}>
        <Text tone="muted">大</Text>
        <Pagination aria-label="大尺寸分页" total={30} defaultCurrent={2} size="lg" />
      </Flex>
    </Grid>
  );
}
