import { Collapse, Flex, Form, FormField, Input, Switch } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function CollapsePreserveContent() {
  const [destroy, setDestroy] = useState(false);
  return (
    <Flex direction="column" gap="md">
      <Flex>
        <Switch checked={destroy} onChange={(event) => setDestroy(event.target.checked)}>
          收起后销毁内容
        </Switch>
      </Flex>
      <Collapse
        defaultActiveKey="draft"
        destroyInactive={destroy}
        items={[
          {
            key: 'draft',
            label: '草稿',
            children: (
              <Form layout="vertical" onSubmit={(event) => event.preventDefault()}>
                <FormField label="项目名称">
                  <Input name="project" placeholder="Leaf Garden" />
                </FormField>
              </Form>
            ),
          },
        ]}
      />
    </Flex>
  );
}
