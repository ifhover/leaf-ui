import { Button, Result, Space, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function ResultBasic() {
  const [feedback, setFeedback] = useState('');
  return (
    <Space direction="vertical" align="stretch">
      <Result
        status="success"
        title="项目已创建"
        description="现在可以开始添加项目内容。"
        extra={
          <Space wrap>
            <Button variant="outline" onClick={() => setFeedback('已返回项目列表')}>
              返回列表
            </Button>
            <Button onClick={() => setFeedback('已打开项目')}>进入项目</Button>
          </Space>
        }
      />
      {feedback && <Text role="status">{feedback}</Text>}
    </Space>
  );
}
