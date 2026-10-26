import { Steps } from '@ifhover/leaf-ui';

const items = [
  { title: 'Create', description: 'Enter basic information' },
  { title: 'Review', description: 'Check and confirm settings' },
  { title: 'Done', description: 'Get started' },
];

export function StepsVertical() {
  return <Steps aria-label="Vertical steps" direction="vertical" current={1} items={items} />;
}
