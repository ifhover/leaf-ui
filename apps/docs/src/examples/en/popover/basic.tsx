import { Button, Flex, Popover } from '@ifhover/leaf-ui';
export function PopoverBasic() {
  return (
    <Flex gap="md" align="center" wrap justify="center">
      <Popover title="Project details" content="See project details and recent updates here.">
        <Button variant="outline">Click for details</Button>
      </Popover>
      <Popover
        title="Hint"
        trigger="hover"
        placement="right"
        content="Find more project information here."
      >
        <Button variant="outline">Hover for details</Button>
      </Popover>
    </Flex>
  );
}
