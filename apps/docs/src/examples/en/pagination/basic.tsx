import { Pagination } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function PaginationBasic() {
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <Pagination
        total={240}
        current={current}
        pageSize={pageSize}
        showSizeChanger
        showQuickJumper
        showTotal={(total, [start, end]) => `${start}–${end} / ${total} items`}
        onChange={(page, size) => {
          setCurrent(page);
          setPageSize(size);
        }}
      />
      <Pagination total={50} size="sm" />
      <Pagination total={240} simple disabled />
      <p className="leaf-demo-note">
        Current page: {current}; page size: {pageSize} items.
      </p>
    </div>
  );
}
