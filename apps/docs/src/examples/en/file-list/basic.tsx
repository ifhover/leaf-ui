import { withBase } from '@rspress/core/runtime';
import { FileList } from '@sudden3/leaf-ui';
export function FileListBasic() {
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <FileList
        items={[
          { url: withBase('/media/landscape-1.svg'), name: 'Summer landscape.svg', size: 414 },
          { url: withBase('/media/landscape-2.svg'), name: 'Mountain trail.svg' },
          {
            url: withBase('/media/sample.pdf'),
            name: 'Project proposal.pdf',
            size: 685,
          },
          { url: withBase('/media/quarterly-data.csv'), name: 'Quarterly data.csv' },
        ]}
      />
    </div>
  );
}
