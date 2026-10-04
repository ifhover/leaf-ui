import { CheckboxGroup } from '@sudden3/leaf-ui';
export function ExtensionDemo() {
  return (
    <CheckboxGroup
      legend="选择 1–2 个兴趣"
      options={['设计', '开发', '摄影']}
      defaultValue={['设计']}
      minCount={1}
      maxCount={2}
    />
  );
}
