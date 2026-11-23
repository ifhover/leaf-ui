import { Button, Flex, Link, Result, Space, Text } from '@ifhover/leaf-ui';
import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';

export function ResultBasic() {
  const [feedback, setFeedback] = useState('');
  return (
    <Flex direction="column" gap="sm" align="center">
      <Result
        title="还没有项目"
        description="你还没有创建任何项目，先创建一个开始使用。"
        extra={
          <Flex direction="column" align="center" gap="md">
            <Space wrap>
              <Button variant="solid" onClick={() => setFeedback('已触发创建项目')}>
                创建项目
              </Button>
              <Button variant="outline" onClick={() => setFeedback('已触发导入项目')}>
                导入项目
              </Button>
            </Space>
            <Link href="#result-api">
              了解更多
              <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </Flex>
        }
      />
      {feedback && <Text role="status">{feedback}</Text>}
    </Flex>
  );
}
