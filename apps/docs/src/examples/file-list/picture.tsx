import { FileList } from '@ifhover/leaf-ui';

const lake = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100"><rect width="160" height="100" fill="#c9ded5"/><path d="M0 80L55 25L110 80L160 45V100H0Z" fill="#527763"/></svg>',
)}`;
const hill = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100"><rect width="160" height="100" fill="#d9e2ec"/><path d="M0 70L65 35L160 85V100H0Z" fill="#6c849b"/></svg>',
)}`;

export function FileListPicture() {
  return (
    <FileList
      listType="picture"
      items={[
        { uid: 'lake', name: '湖畔.svg', url: lake },
        { uid: 'hill', name: '山丘.svg', url: hill },
        { uid: 'notes', name: '项目笔记.txt', url: 'data:text/plain,Project%20notes' },
      ]}
    />
  );
}
