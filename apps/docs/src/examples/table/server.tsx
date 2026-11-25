import { Table, type TableSorterState } from '@ifhover/leaf-ui';
import { useMemo, useState } from 'react';

const allRecords = Array.from({ length: 24 }, (_, index) => ({
  id: `rec-${index + 1}`,
  name: `任务 ${String(index + 1).padStart(2, '0')}`,
  priority: (index % 5) + 1,
  owner: ['林澈', '周岚', '许言', '陈宁'][index % 4] ?? '',
}));

export function TableServer() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [sort, setSort] = useState<TableSorterState | null>(null);

  const currentPageData = useMemo(() => {
    const sorted = [...allRecords];
    if (sort) {
      sorted.sort((a, b) => {
        const delta =
          sort.columnKey === 'priority' ? a.priority - b.priority : a.name.localeCompare(b.name);
        return sort.order === 'desc' ? -delta : delta;
      });
    }
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [page, pageSize, sort]);

  return (
    <Table
      data={currentPageData}
      columns={[
        { dataIndex: 'name', title: '任务', sorter: true },
        { dataIndex: 'priority', title: '优先级', align: 'end', sorter: true },
        { dataIndex: 'owner', title: '负责人' },
      ]}
      rowKey="id"
      aria-label="服务端排序与分页"
      manualSorting
      manualPagination
      sort={sort}
      onSortChange={(next) => {
        setSort(next);
        setPage(1);
      }}
      pagination={{
        current: page,
        pageSize,
        total: allRecords.length,
        onChange: (nextPage, nextSize) => {
          setPage(nextPage);
          setPageSize(nextSize);
        },
      }}
    />
  );
}
