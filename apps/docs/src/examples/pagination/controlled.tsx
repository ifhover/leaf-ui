import { Flex, Pagination, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function PaginationControlled() {
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  return (
    <Flex direction="column" gap={16}>
      <Pagination
        total={240}
        {...pagination}
        showTotal={(total, [start, end]) => `${start}-${end} / ${total} 条`}
        showSizeChanger
        showQuickJumper
        onChange={(current, pageSize) => setPagination({ current, pageSize })}
      />
      <Text tone="muted" role="status">
        第 {pagination.current} 页，每页 {pagination.pageSize} 条
      </Text>
    </Flex>
  );
}
