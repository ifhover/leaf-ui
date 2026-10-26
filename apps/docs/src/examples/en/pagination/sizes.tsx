import { Flex, Grid, Pagination, Text } from '@ifhover/leaf-ui';

export function PaginationSizes() {
  return (
    <Grid columns={1} gap={16}>
      <Flex direction="column" gap={8}>
        <Text tone="muted">Small</Text>
        <Pagination aria-label="Small pagination" total={30} defaultCurrent={2} size="sm" />
      </Flex>
      <Flex direction="column" gap={8}>
        <Text tone="muted">Medium (default)</Text>
        <Pagination aria-label="Medium pagination" total={30} defaultCurrent={2} size="md" />
      </Flex>
      <Flex direction="column" gap={8}>
        <Text tone="muted">Large</Text>
        <Pagination aria-label="Large pagination" total={30} defaultCurrent={2} size="lg" />
      </Flex>
    </Grid>
  );
}
