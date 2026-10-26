import { Steps } from '@ifhover/leaf-ui';

const items = [{ title: '创建' }, { title: '确认' }, { title: '完成' }];

export function Capabilities() {
  return <Steps aria-label="点状步骤" progressDot current={1} items={items} />;
}
