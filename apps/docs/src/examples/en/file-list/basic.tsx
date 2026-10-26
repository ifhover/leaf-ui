import { FileList } from '@ifhover/leaf-ui';

export function FileListBasic() {
  return (
    <FileList
      items={[
        { uid: 'plan', name: 'Project plan.pdf', size: 1024 * 240 },
        { uid: 'data', name: 'Statistics.csv', size: 1024 * 12 },
        { uid: 'empty', name: 'empty.txt', size: 0 },
      ]}
    />
  );
}
