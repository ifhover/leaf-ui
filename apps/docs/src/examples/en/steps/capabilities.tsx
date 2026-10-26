import { Steps } from '@ifhover/leaf-ui';

const items = [{ title: 'Create' }, { title: 'Review' }, { title: 'Done' }];

export function Capabilities() {
  return <Steps aria-label="Dot steps" progressDot current={1} items={items} />;
}
