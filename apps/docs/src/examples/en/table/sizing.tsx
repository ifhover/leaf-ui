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
    name: 'Adjustable desktop monitor arm for 24 to 32 inch screens',
    description: 'Aluminum frame with landscape and portrait rotation',
    status: 'Active',
  },
  {
    id: '2',
    name: 'Wireless keyboard',
    description: 'Switch between three devices',
    status: 'Active',
  },
  {
    id: '3',
    name: 'Desktop organizer',
    description: 'Tiered storage for office supplies',
    status: 'Sold out',
  },
];
const columns: DataTableColumnDef<Product>[] = [
  { accessorKey: 'name', header: 'Product', minSize: 200, meta: { flex: 2 } },
  { accessorKey: 'description', header: 'Description', minSize: 160, meta: { flex: 1 } },
  { accessorKey: 'status', header: 'Status', size: 100 },
];

export function TableSizing() {
  return (
    <DataTable
      data={products}
      columns={columns}
      rowKey="id"
      aria-label="Product column sizing"
      pagination={false}
    />
  );
}
