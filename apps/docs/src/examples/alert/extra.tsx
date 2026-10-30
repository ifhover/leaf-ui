import { Alert, Button } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function AlertExtra() {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Alert
      title="草稿已自动保存"
      description={showDetails ? '重新打开页面时可以继续编辑。' : undefined}
      extra={
        <Button variant="link" onClick={() => setShowDetails((value) => !value)}>
          {showDetails ? '收起详情' : '查看详情'}
        </Button>
      }
      closable
    />
  );
}
