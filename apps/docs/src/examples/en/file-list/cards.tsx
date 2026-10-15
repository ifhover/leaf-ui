import { FileList } from '@ifhover/leaf-ui';
import { withBase } from '@rspress/core/runtime';

export function FileListCards() {
  return (
    <div>
      <FileList
        listType="picture-card"
        items={[
          {
            uid: 'lake',
            url: withBase('/media/landscape-1.svg'),
            name: 'Summer landscape.svg',
            size: 414,
          },
          { uid: 'trail', url: withBase('/media/landscape-2.svg'), name: 'Mountain trail.svg' },
          {
            uid: 'cover',
            url: withBase('/media/landscape-3.svg'),
            name: 'Homepage cover final.svg',
          },
        ]}
      />
    </div>
  );
}
