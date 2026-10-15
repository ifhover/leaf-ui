import { FileList } from '@ifhover/leaf-ui';
import { withBase } from '@rspress/core/runtime';

export function FileListStates() {
  return (
    <div>
      <FileList
        downloadable={false}
        previewable={false}
        items={[
          {
            uid: 'uploading',
            name: '项目介绍.mp4',
            size: 12582912,
            status: 'uploading',
            percent: 42,
          },
          {
            uid: 'done',
            name: '交付说明.pdf',
            size: 685,
            status: 'done',
            url: withBase('/media/sample.pdf'),
          },
          {
            uid: 'error',
            name: '附件包.zip',
            size: 3145728,
            status: 'error',
            error: '连接中断，请重新上传。',
          },
          { uid: 'ready', name: '项目笔记.md', status: 'ready' },
          { uid: 'cancelled', name: '备份文件.zip', status: 'cancelled' },
        ]}
      />
    </div>
  );
}
