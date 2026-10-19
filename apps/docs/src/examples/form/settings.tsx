import { Form, FormField, Select, Switch, Textarea } from '@ifhover/leaf-ui';

export function FormSettings() {
  return (
    <Form layout="settings">
      <FormField label="自动保存" description="编辑时自动保存你的更改。">
        <Switch name="autoSave" defaultChecked />
      </FormField>
      <FormField label="回复语言" description="选择新对话默认使用的语言。">
        <Select
          name="language"
          defaultValue="zh-CN"
          options={[
            { value: 'zh-CN', label: '简体中文' },
            { value: 'en-US', label: 'English' },
          ]}
        />
      </FormField>
      <FormField
        label="自定义指令"
        description="告诉助手你偏好的回复方式。"
        layout="vertical"
        help="此设置用于后续的新对话。"
      >
        <Textarea name="instructions" rows={3} placeholder="例如：回答简洁，优先提供示例。" />
      </FormField>
    </Form>
  );
}
