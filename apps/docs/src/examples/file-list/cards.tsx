import { FileList } from '@ifhover/leaf-ui';
import { withBase } from '@rspress/core/runtime';

export function FileListCards() {
  return (
    <div>
      <FileList
        listType="picture-card"
        items={[
          { uid: 'lake', url: withBase('/media/landscape-1.svg'), name: '夏日风景.svg', size: 414 },
          { uid: 'trail', url: withBase('/media/landscape-2.svg'), name: '山间小径.svg' },
          { uid: 'cover', url: withBase('/media/landscape-3.svg'), name: '首页封面最终稿.svg' },
        ]}
      />
    </div>
  );
}
