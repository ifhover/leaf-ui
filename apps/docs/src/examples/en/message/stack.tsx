import { Button, useMessage } from '@sudden3/leaf-ui';

export function MessageStack() {
  const { message, contextHolder } = useMessage();
  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          message.close();
          message.open({
            key: 'stack-first',
            content: 'The first message closes after one second',
            duration: 1,
          });
          message.open({
            key: 'stack-second',
            content: 'Following messages move up smoothly',
            duration: 5,
            closable: true,
          });
          message.open({
            key: 'stack-third',
            content:
              'Longer messages collapse using their actual height, without jumping to a new position.',
            type: 'success',
            duration: 7,
            closable: true,
          });
        }}
      >
        Show three messages
      </Button>
      {contextHolder}
    </>
  );
}
