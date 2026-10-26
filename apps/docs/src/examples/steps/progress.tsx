import { Steps } from '@ifhover/leaf-ui';

const items = [{ title: '创建' }, { title: '确认', description: '65%' }, { title: '完成' }];

export function StepsProgress() {
  return <Steps aria-label="步骤内进度" current={1} percent={65} items={items} />;
}
