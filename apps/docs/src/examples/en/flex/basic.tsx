import { Button, Flex } from '@ifhover/leaf-ui';

export function FlexBasic() {
  return (
    <Flex gap="sm" wrap>
      <Button>Save</Button>
      <Button>Cancel</Button>
      <Button>More actions</Button>
    </Flex>
  );
}
