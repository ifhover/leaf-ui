import { Button, Flex } from '@ifhover/leaf-ui';

export function FlexVertical() {
  return (
    <Flex direction="column" align="start" gap="sm">
      <Button>Save</Button>
      <Button>Cancel</Button>
      <Button>More actions</Button>
    </Flex>
  );
}
