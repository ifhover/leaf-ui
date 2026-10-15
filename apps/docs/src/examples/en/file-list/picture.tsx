import { FileList } from '@ifhover/leaf-ui';
import { withBase } from '@rspress/core/runtime';

export function FileListPicture() {
  return (
    <div>
      <FileList
        listType="picture"
        items={[
          {
            uid: 'lake',
            url: withBase('/media/landscape-1.svg'),
            name: 'Summer landscape.svg',
            size: 414,
          },
          { uid: 'trail', url: withBase('/media/landscape-2.svg'), name: 'Mountain trail.svg' },
          {
            uid: 'plan',
            url: withBase('/media/sample.pdf'),
            name: 'Project proposal.pdf',
            size: 685,
          },
        ]}
      />
    </div>
  );
}
