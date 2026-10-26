import { Button, Card, Flex, Loading, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function LoadingOverlay() {
  const [spinning, setSpinning] = useState(true);
  const [edited, setEdited] = useState(false);

  return (
    <Flex direction="column" gap="md">
      <Flex>
        <Button variant="outline" onClick={() => setSpinning((value) => !value)}>
          {spinning ? 'Finish loading' : 'Start loading'}
        </Button>
      </Flex>
      <Loading spinning={spinning} tip="Loading projects">
        <Card title="Project overview">
          <Flex direction="column" gap="md">
            <Text>See project progress here.</Text>
            <Flex>
              <Button variant="outline" onClick={() => setEdited(true)}>
                Edit project
              </Button>
            </Flex>
            {edited && <Text role="status">Project editor opened</Text>}
          </Flex>
        </Card>
      </Loading>
    </Flex>
  );
}
