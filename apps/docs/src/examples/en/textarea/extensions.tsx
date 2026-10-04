import { Space, Textarea } from '@sudden3/leaf-ui';
export function ExtensionDemo() {
  return (
    <Space direction="vertical" align="stretch">
      <label htmlFor="textarea-extension-1">
        Auto height
        <Textarea
          id="textarea-extension-1"
          autoSize={{ minRows: 2, maxRows: 6 }}
          placeholder="Type more content"
        />
      </label>
      <label htmlFor="textarea-extension-2">
        Character count
        <Textarea
          id="textarea-extension-2"
          showCount
          maxLength={120}
          defaultValue="Start your plan here."
        />
      </label>
    </Space>
  );
}
