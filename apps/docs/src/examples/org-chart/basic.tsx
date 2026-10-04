import { OrgChart } from '@sudden3/leaf-ui';

export function OrgChartBasic() {
  return (
    <OrgChart
      style={{ width: '100%' }}
      data={{
        key: 'team',
        label: 'Leaf Studio',
        description: '产品团队',
        children: [
          {
            key: 'design',
            label: '设计',
            children: [
              { key: 'ux', label: 'UX' },
              { key: 'visual', label: '视觉' },
            ],
          },
          {
            key: 'engineering',
            label: '研发',
            children: [
              { key: 'web', label: 'Web' },
              { key: 'mobile', label: 'Mobile' },
            ],
          },
        ],
      }}
    />
  );
}
