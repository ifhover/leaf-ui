import { Steps } from '@ifhover/leaf-ui';

const items = [{ title: 'Create' }, { title: 'Review' }, { title: 'Done' }];

export function StepsBasic() {
  return <Steps aria-label="Task steps" items={items} current={1} />;
}
