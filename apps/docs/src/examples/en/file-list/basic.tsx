import { FileList, Space } from '@ifhover/leaf-ui';
import { withBase } from '@rspress/core/runtime';
export function FileListBasic() {
  return (
    <Space direction="vertical" align="stretch">
      <FileList
        items={[
          {
            url: withBase('/media/sample.pdf'),
            name: 'Project proposal.pdf',
            size: 685,
          },
          { url: withBase('/media/quarterly-data.csv'), name: 'Quarterly data.csv' },
          { url: withBase('/media/landscape-1.svg'), name: 'Summer landscape.svg', size: 414 },
          { url: withBase('/media/file-list-readme.md'), name: 'Delivery notes.md' },
        ]}
      />
    </Space>
  );
}
