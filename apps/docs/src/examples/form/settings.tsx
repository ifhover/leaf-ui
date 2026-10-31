import { Form, FormField, Select, Switch, Textarea } from '@ifhover/leaf-ui';

export function FormSettings() {
  return (
    <Form layout="settings">
      <FormField label="界面语言">
        <Select
          name="language"
          defaultValue="zh-CN"
          options={[
            { value: 'zh-CN', label: '简体中文' },
            { value: 'en-US', label: 'English' },
          ]}
        />
      </FormField>
      <FormField label="自动保存" description="编辑时自动保存更改。">
        <Switch name="autoSave" defaultChecked />
      </FormField>
      <FormField
        label="个人简介"
        description="向其他成员介绍自己。"
        layout="vertical"
        help="最多 120 个字符。"
      >
        <Textarea name="biography" rows={3} maxLength={120} />
      </FormField>
    </Form>
  );
}
