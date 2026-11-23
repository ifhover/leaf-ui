import { Button, Flex, Link, Result, Space, Text } from '@ifhover/leaf-ui';
import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';

export function ResultBasic() {
  const [feedback, setFeedback] = useState('');
  return (
    <Flex direction="column" gap="sm" align="center">
      <Result
        title="No projects yet"
        description="You haven't created any projects yet. Get started by creating your first project."
        extra={
          <Flex direction="column" align="center" gap="md">
            <Space wrap>
              <Button variant="solid" onClick={() => setFeedback('Create project triggered')}>
                Create project
              </Button>
              <Button variant="outline" onClick={() => setFeedback('Import project triggered')}>
                Import project
              </Button>
            </Space>
            <Link href="#result-api">
              Learn more
              <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </Flex>
        }
      />
      {feedback && <Text role="status">{feedback}</Text>}
    </Flex>
  );
}
