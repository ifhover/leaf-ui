import { FileList } from '@ifhover/leaf-ui';

const pdf =
  'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCAyMDAgMTIwXSAvQ29udGVudHMgNCAwIFIgL1Jlc291cmNlcyA8PCAvRm9udCA8PCAvRjEgNSAwIFIgPj4gPj4gPj4KZW5kb2JqCjQgMCBvYmoKPDwgL0xlbmd0aCA0NCA+PgpzdHJlYW0KQlQgL0YxIDE0IFRmIDIwIDYwIFRkIChMZWFmIFVJIHNhbXBsZSkgVGogRVQKZW5kc3RyZWFtCmVuZG9iago1IDAgb2JqCjw8IC9UeXBlIC9Gb250IC9TdWJ0eXBlIC9UeXBlMSAvQmFzZUZvbnQgL0hlbHZldGljYSA+PgplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMjQxIDAwMDAwIG4gCjAwMDAwMDAzMzUgMDAwMDAgbiAKdHJhaWxlcgo8PCAvU2l6ZSA2IC9Sb290IDEgMCBSID4+CnN0YXJ0eHJlZgo0MDUKJSVFT0YK';

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
            size: 588,
            status: 'done',
            url: pdf,
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
