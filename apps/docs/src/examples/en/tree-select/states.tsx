import { Form, FormField, TreeSelect } from '@ifhover/leaf-ui';
import { treeOptions } from './options';
export function TreeSelectStates() {
  return (
    <Form layout="vertical">
      <FormField label="Disabled">
        <TreeSelect options={treeOptions} disabled defaultValue="web" />
      </FormField>
      <FormField label="Validation feedback">
        <TreeSelect options={treeOptions} status="error" placeholder="Select a team" />
      </FormField>
      <FormField label="Custom popup width">
        <TreeSelect options={treeOptions} popupWidth={320} popupMaxWidth={360} defaultExpandAll />
      </FormField>
    </Form>
  );
}
