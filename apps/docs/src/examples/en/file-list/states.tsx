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
            name: 'Project introduction.mp4',
            size: 12582912,
            status: 'uploading',
            percent: 42,
          },
          {
            uid: 'done',
            name: 'Delivery notes.pdf',
            size: 588,
            status: 'done',
            url: pdf,
          },
          {
            uid: 'error',
            name: 'Attachments.zip',
            size: 3145728,
            status: 'error',
            error: 'Connection interrupted. Please upload again.',
          },
          { uid: 'ready', name: 'Project notes.md', status: 'ready' },
          { uid: 'cancelled', name: 'Backup.zip', status: 'cancelled' },
        ]}
      />
    </div>
  );
}
