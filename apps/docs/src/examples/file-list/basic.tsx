import { FileList, Space } from '@ifhover/leaf-ui';
import { withBase } from '@rspress/core/runtime';
export function FileListBasic() {
  return (
    <Space direction="vertical" align="stretch" className="leaf-demo-stack leaf-demo-stack--wide">
      <FileList
        items={[
          { url: withBase('/media/landscape-1.svg'), name: '夏日风景.svg', size: 414 },
          { url: withBase('/media/landscape-2.svg'), name: '山间小径.svg' },
          {
            url: withBase('/media/sample.pdf'),
            name: '项目方案.pdf',
            size: 685,
          },
          { url: withBase('/media/quarterly-data.csv'), name: '季度数据.csv' },
        ]}
      />
    </Space>
  );
}
