import { Collapse } from '@ifhover/leaf-ui';

export function CollapseAccordion() {
  return (
    <Collapse
      accordion
      defaultActiveKey="about"
      items={[
        { key: 'about', label: '项目介绍', children: '项目资料与协作说明。' },
        { key: 'updates', label: '更新记录', children: '查看最近的功能与内容更新。' },
        { key: 'archived', label: '已归档', children: null, disabled: true },
      ]}
    />
  );
}
