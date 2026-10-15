import { Form, FormField, Textarea } from '@ifhover/leaf-ui';

export function TextareaBasic() {
  return (
    <Form layout="vertical">
      <FormField label="项目简介">
        <Textarea
          aria-label="项目简介"
          placeholder="描述一下你的新想法…"
          rows={3}
          maxLength={200}
        />
      </FormField>
      <FormField label="只读介绍">
        <Textarea aria-label="只读介绍" defaultValue="把灵感，种进界面。" readOnly rows={2} />
      </FormField>
      <FormField label="禁用介绍">
        <Textarea aria-label="禁用介绍" placeholder="暂时不可编辑" disabled rows={2} />
      </FormField>
    </Form>
  );
}
