import { Space, Textarea } from '@sudden3/leaf-ui';
export function ExtensionDemo() {
  return (
    <Space direction="vertical" align="stretch">
      <label htmlFor="textarea-extension-1">
        自动高度
        <Textarea
          id="textarea-extension-1"
          autoSize={{ minRows: 2, maxRows: 6 }}
          placeholder="输入更多内容试试"
        />
      </label>
      <label htmlFor="textarea-extension-2">
        字数统计
        <Textarea
          id="textarea-extension-2"
          showCount
          maxLength={120}
          defaultValue="计划从这里开始。"
        />
      </label>
    </Space>
  );
}
