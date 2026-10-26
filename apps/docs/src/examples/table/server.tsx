import { Button, Flex } from '@ifhover/leaf-ui';
import { DataTable, useDataTable } from '@ifhover/leaf-ui/table';
import type { OnChangeFn, PaginationState, SortingState } from '@tanstack/react-table';
import { useEffect, useState } from 'react';

const members = Array.from({ length: 26 }, (_, index) => ({
  id: String(index + 1),
  name: ['Alex', 'Sam', 'Riley'][index % 3] ?? '',
  team: index % 2 ? 'Design' : 'Engineering',
  projects: index + 1,
}));
const columns = [
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'projects', header: '项目数' },
  { accessorKey: 'team', header: '团队', enableSorting: false },
];

export function TableServer() {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const onSortingChange: OnChangeFn<SortingState> = (updater) => {
    setSorting(updater);
    setPagination((previous) => ({ ...previous, pageIndex: 0 }));
  };
  const [data, setData] = useState<typeof members>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [request, setRequest] = useState({ revision: 0, fail: false });
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    // 本地定时器模拟接口；实际请求应传入 controller.signal。
    const timer = setTimeout(() => {
      if (controller.signal.aborted) return;
      if (request.fail) {
        setError(true);
        setLoading(false);
        return;
      }
      const sorted = [...members];
      const order = sorting[0];
      if (order) {
        sorted.sort((first, second) => {
          const result =
            order.id === 'projects'
              ? first.projects - second.projects
              : first.name.localeCompare(second.name);
          return order.desc ? -result : result;
        });
      }
      setData(
        sorted.slice(
          pagination.pageIndex * pagination.pageSize,
          (pagination.pageIndex + 1) * pagination.pageSize,
        ),
      );
      setLoading(false);
    }, 400);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [pagination, sorting, request]);
  const table = useDataTable({
    data,
    columns,
    rowKey: 'id',
    localPagination: false,
    options: {
      state: { pagination, sorting },
      onPaginationChange: setPagination,
      onSortingChange,
      manualPagination: true,
      manualSorting: true,
      enableSorting: true,
      enableMultiSort: false,
      rowCount: members.length,
    },
  });
  const reload = (fail: boolean) =>
    setRequest((previous) => ({ revision: previous.revision + 1, fail }));
  return (
    <Flex direction="column" gap="md">
      <DataTable
        table={table}
        aria-label="远程成员"
        loading={loading}
        error={error ? '成员加载失败' : undefined}
        onRetry={() => reload(false)}
        pagination={{ pageSizeOptions: [5, 10, 20] }}
      />
      <Flex gap="sm" wrap>
        <Button disabled={loading} onClick={() => reload(false)}>
          刷新
        </Button>
        <Button disabled={loading} onClick={() => reload(true)}>
          模拟失败
        </Button>
        <Button disabled={loading || !sorting.length} onClick={() => table.resetSorting()}>
          清除排序
        </Button>
      </Flex>
    </Flex>
  );
}
