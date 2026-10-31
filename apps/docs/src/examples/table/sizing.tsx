import { DataTable, type DataTableColumnDef } from '@ifhover/leaf-ui/table';

interface Product {
  id: string;
  name: string;
  description: string;
  status: string;
}

const products: Product[] = [
  {
    id: '1',
    name: '可调节桌面显示器支架，适用 24 至 32 英寸屏幕',
    description: '铝合金材质，支持横竖屏切换',
    status: '在售',
  },
  { id: '2', name: '无线键盘', description: '支持三台设备切换', status: '在售' },
  { id: '3', name: '桌面收纳架', description: '分层收纳常用办公用品', status: '缺货' },
];
const columns: DataTableColumnDef<Product>[] = [
  { accessorKey: 'name', header: '商品名称', minSize: 200, meta: { flex: 2 } },
  { accessorKey: 'description', header: '说明', minSize: 160, meta: { flex: 1 } },
  { accessorKey: 'status', header: '状态', size: 100 },
];

export function TableSizing() {
  return (
    <DataTable
      data={products}
      columns={columns}
      rowKey="id"
      aria-label="商品列宽分配"
      pagination={false}
    />
  );
}
