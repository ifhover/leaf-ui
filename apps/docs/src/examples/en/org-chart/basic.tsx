import { OrgChart } from '@sudden3/leaf-ui';

export function OrgChartBasic() {
  return (
    <OrgChart
      style={{ width: '100%' }}
      data={{
        key: 'team',
        label: 'Leaf Studio',
        description: 'Product team',
        children: [
          {
            key: 'design',
            label: 'Design',
            children: [
              { key: 'ux', label: 'UX' },
              { key: 'visual', label: 'Visual' },
            ],
          },
          {
            key: 'engineering',
            label: 'Engineering',
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
