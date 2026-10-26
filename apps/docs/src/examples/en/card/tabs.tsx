import { Card, Text } from '@ifhover/leaf-ui';

export function CardTabs() {
  return (
    <Card
      tabs={{
        'aria-label': 'Project overview',
        items: [
          {
            key: 'overview',
            label: 'Overview',
            children: <Text>Keep design and development working from the same plan.</Text>,
          },
          {
            key: 'activity',
            label: 'Activity',
            children: <Text>The component guidelines were updated today.</Text>,
          },
        ],
      }}
    />
  );
}
