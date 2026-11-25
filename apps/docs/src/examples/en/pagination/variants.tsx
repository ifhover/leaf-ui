import { Flex, Grid, Pagination, Text } from '@ifhover/leaf-ui';

export function PaginationVariants() {
  return (
    <Grid columns={1} gap={16}>
      <Flex direction="column" gap={8}>
        <Text tone="muted">Outline (default)</Text>
        <Pagination aria-label="Outline pagination" total={30} defaultCurrent={2} />
      </Flex>
      <Flex direction="column" gap={8}>
        <Text tone="muted">Ghost</Text>
        <Pagination aria-label="Ghost pagination" total={30} defaultCurrent={2} variant="ghost" />
      </Flex>
    </Grid>
  );
}
