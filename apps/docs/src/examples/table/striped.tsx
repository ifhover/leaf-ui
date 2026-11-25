import { Table } from '@ifhover/leaf-ui';

const tasks = [
  { id: '1', name: '设计系统颜色检查', owner: '林澈', progress: '100%' },
  { id: '2', name: '分页控件默认值切换', owner: '周岚', progress: '85%' },
  { id: '3', name: '表格虚拟滚动验证', owner: '许言', progress: '60%' },
  { id: '4', name: '多语言翻译核对', owner: '陈宁', progress: '40%' },
];

export function TableStriped() {
  return (
    <Table
      striped
      data={tasks}
      columns={[
        { dataIndex: 'name', title: '任务' },
        { dataIndex: 'owner', title: '负责人' },
        { dataIndex: 'progress', title: '进度', align: 'end' },
      ]}
      rowKey="id"
      aria-label="斑马条纹任务表"
      pagination={false}
    />
  );
}
