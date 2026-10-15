import { Pagination } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function PaginationControlled() {
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  return (
    <Pagination
      total={240}
      {...pagination}
      showTotal
      showSizeChanger
      showQuickJumper
      onChange={(current, pageSize) => setPagination({ current, pageSize })}
    />
  );
}
