import { Button, Modal, Paragraph, Space } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function ModalFooter() {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Custom footer</Button>
      <Modal
        open={open}
        title="About drafts"
        onClose={() => setOpen(false)}
        footer={({ cancelButton, confirmButton }) => (
          <Space wrap>
            <Button variant="text" onClick={() => setDetails(!details)}>
              {details ? 'Hide details' : 'View details'}
            </Button>
            {cancelButton}
            {confirmButton}
          </Space>
        )}
      >
        <Paragraph>New documents are saved as drafts and can be edited later.</Paragraph>
        {details && <Paragraph>Drafts are visible only to you until you publish them.</Paragraph>}
      </Modal>
    </>
  );
}
