import { Button, ButtonGroup, Space, SplitButton } from '@sudden3/leaf-ui';
export function ExtensionDemo() {
  return (
    <Space direction="vertical" align="start">
      <div>
        <p>Button group</p>
        <ButtonGroup>
          <Button variant="outline">Previous</Button>
          <Button variant="outline">Next</Button>
        </ButtonGroup>
      </div>
      <div>
        <p>Split button</p>
        <SplitButton
          items={[
            { key: 'copy', label: 'Save a copy' },
            { key: 'draft', label: 'Save draft' },
          ]}
        >
          Save
        </SplitButton>
      </div>
    </Space>
  );
}
