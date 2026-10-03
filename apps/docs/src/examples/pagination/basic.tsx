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
        showTotal={(total, [start, end]) => `${start}–${end} / ${total} 条`}
        onChange={(page, size) => {
          setCurrent(page);
          setPageSize(size);
        }}
      />
      <Pagination total={50} size="sm" />
      <Pagination total={240} simple disabled />
      <p className="leaf-demo-note">
        当前第 {current} 页，每页 {pageSize} 条。
      </p>
    </div>
  );
}
