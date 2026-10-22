import { type FileItem, FileList, Space, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

const textFile = (text: string) => `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`;

export function FileListActions() {
  const [items, setItems] = useState<FileItem[]>([
    { uid: 'a', url: 'https://github.com/ifhover/leaf-ui/archive/refs/heads/main.zip' },
    { uid: 'b', url: textFile('# 交付说明\n\n- 设计稿与切图\n- 版本 1.0'), name: '交付说明.md' },
    { uid: 'c', url: textFile(''), name: 'empty.txt', size: 0 },
  ]);
  return (
    <Space direction="vertical" align="stretch">
      <Text tone="muted">
        名称可以省略并从 URL 获取，也可以显式提供；文件大小可不填写。零字节文件也会展示大小。
      </Text>
      <FileList
        items={items}
        removable
        onRemove={(file) => setItems((current) => current.filter((item) => item.uid !== file.uid))}
      />
    </Space>
  );
}
