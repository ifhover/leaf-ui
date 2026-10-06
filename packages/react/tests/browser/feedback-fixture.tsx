import { Alert, Button, ConfigProvider, Drawer, Result, useMessage } from '@sudden3/leaf-ui';
import { useState } from 'react';
import { ExtensionDemo } from '../../../../apps/docs/src/examples/form/extensions';
import { ModalBasic } from '../../../../apps/docs/src/examples/modal/basic';

function FeedbackContent() {
  const [drawer, setDrawer] = useState(false);
  const { message } = useMessage();
  return (
    <>
      <div style={{ width: 380, maxWidth: '100%' }}>
        <ExtensionDemo />
      </div>
      <ModalBasic />
      <Button onClick={() => setDrawer(true)}>Open feedback drawer</Button>
      <Drawer open={drawer} onClose={() => setDrawer(false)} title="Feedback drawer">
        Drawer content
      </Drawer>
      <Button onClick={() => message.success('Saved successfully', 0)}>
        Show feedback message
      </Button>
      <div style={{ display: 'grid', gap: 16, marginBlock: 24, maxWidth: 560 }}>
        <Alert title="Changes saved" description="Your project is ready to share." type="success" />
        <Alert title="A newer version is available" type="info" closable />
        <Alert
          title="Review before publishing"
          description="Some fields need attention."
          type="warning"
        />
        <Alert title="Unable to save" type="error" />
      </div>
      <Result
        status="success"
        title="项目已创建"
        description="一切准备就绪，可以开始你的下一个好想法。"
        extra={<Button>进入项目</Button>}
      />
    </>
  );
}

export function FeedbackFixture() {
  const [blur, setBlur] = useState(true);
  return (
    <ConfigProvider maskBlur={blur} theme={{ tokens: { motionDuration: 500 } }}>
      <Button onClick={() => setBlur(!blur)}>Toggle mask blur</Button>
      <FeedbackContent />
    </ConfigProvider>
  );
}
