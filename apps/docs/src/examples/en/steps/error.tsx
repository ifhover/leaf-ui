import { Steps } from '@ifhover/leaf-ui';

const items = [{ title: 'Create' }, { title: 'Review' }, { title: 'Done' }];

export function StepsError() {
  return <Steps aria-label="Failed step" current={1} status="error" items={items} />;
}
