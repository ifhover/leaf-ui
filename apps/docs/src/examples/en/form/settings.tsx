import { Form, FormField, Select, Switch, Textarea } from '@ifhover/leaf-ui';

export function FormSettings() {
  return (
    <Form layout="settings">
      <FormField label="Auto-save" description="Save your changes automatically while editing.">
        <Switch name="autoSave" defaultChecked />
      </FormField>
      <FormField label="Response language" description="Choose the default language for new chats.">
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
        label="Custom instructions"
        description="Tell the assistant how you prefer it to respond."
        layout="vertical"
        help="This setting applies to future chats."
      >
        <Textarea
          name="instructions"
          rows={3}
          placeholder="For example: be concise and include examples."
        />
      </FormField>
    </Form>
  );
}
