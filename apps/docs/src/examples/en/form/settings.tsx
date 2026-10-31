import { Form, FormField, Select, Switch, Textarea } from '@ifhover/leaf-ui';

export function FormSettings() {
  return (
    <Form layout="settings">
      <FormField label="Language">
        <Select
          name="language"
          defaultValue="zh-CN"
          options={[
            { value: 'zh-CN', label: 'Simplified Chinese' },
            { value: 'en-US', label: 'English' },
          ]}
        />
      </FormField>
      <FormField label="Auto-save" description="Save changes automatically while editing.">
        <Switch name="autoSave" defaultChecked />
      </FormField>
      <FormField
        label="Biography"
        description="Introduce yourself to other members."
        layout="vertical"
        help="Up to 120 characters."
      >
        <Textarea name="biography" rows={3} maxLength={120} />
      </FormField>
    </Form>
  );
}
