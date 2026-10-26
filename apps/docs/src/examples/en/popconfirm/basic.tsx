import { Button, Flex, Popconfirm, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function PopconfirmBasic() {
  const [removed, setRemoved] = useState(false);
  return (
    <Flex direction="column" gap="md" align="start">
      <Popconfirm
        title="Remove this project?"
        description="You can restore it from the recycle bin."
        onConfirm={() => setRemoved(true)}
      >
        <Button variant="outline" danger disabled={removed}>
          Remove project
        </Button>
      </Popconfirm>
      {removed && <Text role="status">Project removed.</Text>}
    </Flex>
  );
}
