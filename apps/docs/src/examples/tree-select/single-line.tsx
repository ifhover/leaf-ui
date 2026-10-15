import { Form, FormField, TreeSelect } from '@ifhover/leaf-ui';
import { treeOptions } from './options';

export function SingleLine() {
  return (
    <Form layout="vertical">
      <FormField label="单行多选">
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
