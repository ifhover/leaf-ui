import { Button, useMessage } from '@ifhover/leaf-ui';

export function MessageBasic() {
  const { message } = useMessage();
  return <Button onClick={() => message.info('Changes saved')}>Show message</Button>;
}
