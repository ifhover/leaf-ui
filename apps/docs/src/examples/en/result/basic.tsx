import { Button, Result, Space, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function ResultBasic() {
  const [feedback, setFeedback] = useState('');
  return (
    <Space direction="vertical" align="stretch">
      <Result
        status="success"
        title="Project created"
        description="You can now add content to the project."
        extra={
          <Space wrap>
            <Button variant="outline" onClick={() => setFeedback('Returned to project list')}>
              Back to list
            </Button>
            <Button onClick={() => setFeedback('Project opened')}>Open project</Button>
          </Space>
        }
      />
      {feedback && <Text role="status">{feedback}</Text>}
    </Space>
  );
}
