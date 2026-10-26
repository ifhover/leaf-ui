import { Steps } from '@ifhover/leaf-ui';

const items = [
  { title: '创建', description: '填写基本信息' },
  { title: '确认', description: '检查并确认配置' },
  { title: '完成', description: '开始使用' },
];

export function StepsVertical() {
  return <Steps aria-label="纵向步骤" direction="vertical" current={1} items={items} />;
}
