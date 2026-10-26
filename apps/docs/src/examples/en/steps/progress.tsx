import { Steps } from '@ifhover/leaf-ui';

const items = [{ title: 'Create' }, { title: 'Review', description: '65%' }, { title: 'Done' }];

export function StepsProgress() {
  return <Steps aria-label="Progress within a step" current={1} percent={65} items={items} />;
}
