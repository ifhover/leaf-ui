import { Button, Flex } from '@ifhover/leaf-ui';

export function FlexBasic() {
  return (
    <Flex gap="sm" wrap>
      <Button>Save</Button>
      <Button variant="outline">Cancel</Button>
      <Button variant="soft">More actions</Button>
    </Flex>
  );
}
