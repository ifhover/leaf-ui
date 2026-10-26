import { Flex, Grid, Pagination, Text } from '@ifhover/leaf-ui';

export function PaginationVariants() {
  return (
    <Grid columns={1} gap={16}>
      <Flex direction="column" gap={8}>
        <Text tone="muted">描边（默认）</Text>
        <Pagination aria-label="描边分页" total={30} defaultCurrent={2} />
      </Flex>
      <Flex direction="column" gap={8}>
        <Text tone="muted">无边框</Text>
        <Pagination aria-label="无边框分页" total={30} defaultCurrent={2} variant="ghost" />
      </Flex>
    </Grid>
  );
}
