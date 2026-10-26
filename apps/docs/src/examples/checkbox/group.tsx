import { CheckboxGroup } from '@ifhover/leaf-ui';

export function CheckboxGroupDemo() {
  return (
    <CheckboxGroup
      legend="订阅内容"
      defaultValue={['design']}
      options={[
        { value: 'design', label: '设计更新' },
        { value: 'product', label: '产品动态' },
        { value: 'weekly', label: '每周摘要' },
      ]}
    />
  );
}
