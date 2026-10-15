import { FileList, Space } from '@ifhover/leaf-ui';
import { withBase } from '@rspress/core/runtime';
export function FileListBasic() {
  return (
    <Space direction="vertical" align="stretch">
      <FileList
        items={[
          {
            url: withBase('/media/sample.pdf'),
            name: '项目方案.pdf',
            size: 685,
          },
          { url: withBase('/media/quarterly-data.csv'), name: '季度数据.csv' },
          { url: withBase('/media/landscape-1.svg'), name: '夏日风景.svg', size: 414 },
          { url: withBase('/media/file-list-readme.md'), name: '交付说明.md' },
        ]}
      />
    </Space>
  );
}
