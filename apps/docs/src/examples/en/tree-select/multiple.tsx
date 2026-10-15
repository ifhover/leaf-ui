import { Form, FormField, TreeSelect } from '@ifhover/leaf-ui';
import { treeOptions } from './options';
export function TreeSelectMultiple() {
  return (
    <Form layout="vertical">
      <FormField label="Multiple · Select individual items">
        <TreeSelect options={treeOptions} multiple defaultValue={['visual']} defaultExpandAll />
      </FormField>
      <FormField label="Linked checks · Child values">
        <TreeSelect
          options={treeOptions}
          treeCheckable
          defaultValue={['visual']}
          defaultExpandAll
        />
      </FormField>
      <FormField label="Linked checks · Parent values">
        <TreeSelect
          options={treeOptions}
          treeCheckable
          showCheckedStrategy="parent"
          defaultValue={['design']}
          defaultExpandAll
        />
      </FormField>
    </Form>
  );
}
