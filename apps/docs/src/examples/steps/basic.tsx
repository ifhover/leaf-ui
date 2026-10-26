import { Steps } from '@ifhover/leaf-ui';

const items = [{ title: '创建' }, { title: '确认' }, { title: '完成' }];

export function StepsBasic() {
  return <Steps aria-label="任务步骤" items={items} current={1} />;
}
