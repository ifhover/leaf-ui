import { Button, Space, useMessage } from '@ifhover/leaf-ui';

export function MessageStates() {
  const { message } = useMessage();
  return (
    <Space wrap>
      <Button onClick={() => message.info('You have a new comment')}>Info</Button>
      <Button onClick={() => message.success('Changes saved')}>Success</Button>
      <Button onClick={() => message.warning('You have unsaved changes')}>Warning</Button>
      <Button onClick={() => message.danger('Unable to save. Please try again.')}>Error</Button>
    </Space>
  );
}
