import { Form, FormField, TreeSelect } from '@ifhover/leaf-ui';
import { treeOptions } from './options';

export function SingleLine() {
  return (
    <Form layout="vertical">
      <FormField label="Multiple values on one line">
        <TreeSelect
          treeCheckable
          tagWrap={false}
          options={treeOptions}
          defaultValue={['visual', 'product', 'web', 'server']}
          treeDefaultExpandedKeys={['design']}
        />
      </FormField>
    </Form>
  );
}
