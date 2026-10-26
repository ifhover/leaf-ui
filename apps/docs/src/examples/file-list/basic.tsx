import { FileList } from '@ifhover/leaf-ui';

export function FileListBasic() {
  return (
    <FileList
      items={[
        { uid: 'plan', name: '项目方案.pdf', size: 1024 * 240 },
        { uid: 'data', name: '统计数据.csv', size: 1024 * 12 },
        { uid: 'empty', name: 'empty.txt', size: 0 },
      ]}
    />
  );
}
