import { Button, ButtonGroup, Space, SplitButton } from '@sudden3/leaf-ui';
export function ExtensionDemo() {
  return (
    <Space direction="vertical" align="start">
      <div>
        <p>按钮组</p>
        <ButtonGroup>
          <Button variant="outline">上一步</Button>
          <Button variant="outline">下一步</Button>
        </ButtonGroup>
      </div>
      <div>
        <p>分裂按钮</p>
        <SplitButton
          items={[
            { key: 'copy', label: '保存副本' },
            { key: 'draft', label: '存为草稿' },
          ]}
        >
          保存
        </SplitButton>
      </div>
    </Space>
  );
}
