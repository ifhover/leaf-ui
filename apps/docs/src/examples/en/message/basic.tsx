import { Button, useMessage } from '@sudden3/leaf-ui';
export function MessageBasic() {
  const { message, contextHolder } = useMessage();
  async function save() {
    const key = message.loading('Saving');
    await new Promise((resolve) => setTimeout(resolve, 1200));
    message.open({
      key,
      type: 'success',
      content: 'Saved successfully',
      duration: 3,
      closable: true,
    });
  }
  return (
    <>
      <div className="leaf-demo-row">
        <Button onClick={save}>Save asynchronously</Button>
        <Button variant="outline" onClick={() => message.info('An information message')}>
          Information
        </Button>
        <Button danger variant="soft" onClick={() => message.error('Failed. Please try again.')}>
          Error
        </Button>
        <Button variant="ghost" onClick={() => message.close()}>
          Clear messages
        </Button>
      </div>
      {contextHolder}
    </>
  );
}
