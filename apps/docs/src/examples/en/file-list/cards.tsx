import { FileList } from '@ifhover/leaf-ui';

const landscape = (background: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 640"><rect width="960" height="640" fill="${background}"/><circle cx="480" cy="180" r="72" fill="#fff" opacity=".5"/><path d="M0 520L340 250L660 560L960 330V640H0Z" fill="#315242" opacity=".55"/></svg>`,
  )}`;

export function FileListCards() {
  return (
    <div>
      <FileList
        listType="picture-card"
        items={[
          { uid: 'lake', url: landscape('#b9d3bf'), name: 'Summer landscape.svg' },
          { uid: 'trail', url: landscape('#dae2eb'), name: 'Mountain trail.svg' },
          { uid: 'cover', url: landscape('#e1d9ca'), name: 'Homepage cover final.svg' },
        ]}
      />
    </div>
  );
}
