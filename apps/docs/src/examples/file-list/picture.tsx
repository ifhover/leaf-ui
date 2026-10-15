import { FileList } from '@ifhover/leaf-ui';
import { withBase } from '@rspress/core/runtime';

export function FileListPicture() {
  return (
    <div>
      <FileList
        listType="picture"
        items={[
          { uid: 'lake', url: withBase('/media/landscape-1.svg'), name: '夏日风景.svg', size: 414 },
          { uid: 'trail', url: withBase('/media/landscape-2.svg'), name: '山间小径.svg' },
          { uid: 'plan', url: withBase('/media/sample.pdf'), name: '项目方案.pdf', size: 685 },
        ]}
      />
    </div>
  );
}
