import { Button, useMessage } from '@ifhover/leaf-ui';

export function MessageManual() {
  const { message } = useMessage();
  return (
    <Button
      onClick={() =>
        message.open({
          content: 'This message stays until you close it',
          duration: 0,
          closable: true,
        })
      }
    >
      Show persistent message
    </Button>
  );
}
