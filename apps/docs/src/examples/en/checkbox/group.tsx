import { CheckboxGroup } from '@ifhover/leaf-ui';

export function CheckboxGroupDemo() {
  return (
    <CheckboxGroup
      legend="Subscriptions"
      defaultValue={['design']}
      options={[
        { value: 'design', label: 'Design updates' },
        { value: 'product', label: 'Product news' },
        { value: 'weekly', label: 'Weekly updates' },
      ]}
    />
  );
}
