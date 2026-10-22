import { Button, Flex, useMessage } from '@ifhover/leaf-ui';
export function MessageBasic() {
  const { message } = useMessage();
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
    <Flex gap="md" align="center" wrap justify="center">
      <Button onClick={save}>Save asynchronously</Button>
      <Button variant="outline" onClick={() => message.info('An information message')}>
        Information
      </Button>
      <Button danger variant="outline" onClick={() => message.danger('Failed. Please try again.')}>
        Error
      </Button>
      <Button variant="outline" onClick={() => message.success('Completed successfully')}>
        Success
      </Button>
      <Button variant="outline" onClick={() => message.warning('Please check your input')}>
        Warning
      </Button>
      <Button onClick={() => message.close()}>Clear messages</Button>
    </Flex>
  );
}
