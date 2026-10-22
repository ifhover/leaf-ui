import { Button, Flex } from '@ifhover/leaf-ui';

export function FlexBasic() {
  return (
    <Flex gap="sm" wrap>
      <Button variant="solid">Save</Button>
      <Button variant="outline">Cancel</Button>
      <Button variant="link">More actions</Button>
    </Flex>
  );
}
