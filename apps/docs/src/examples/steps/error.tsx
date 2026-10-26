import { Steps } from '@ifhover/leaf-ui';

const items = [{ title: '创建' }, { title: '确认' }, { title: '完成' }];

export function StepsError() {
  return <Steps aria-label="出错步骤" current={1} status="error" items={items} />;
}
