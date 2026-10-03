import { Button, type StepItem, Steps } from '@sudden3/leaf-ui';
import { useState } from 'react';

const items: readonly StepItem[] = [
  { title: '创建项目', description: '填写基本信息' },
  { title: '确认配置', description: '检查项目信息' },
  { title: '完成', description: '开始使用' },
];
export function StepsBasic() {
  const [current, setCurrent] = useState(1);
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <Steps items={items} current={current} onChange={setCurrent} />
      <div className="leaf-demo-row">
        <Button variant="outline" disabled={current === 0} onClick={() => setCurrent(current - 1)}>
          上一步
        </Button>
        <Button disabled={current === 2} onClick={() => setCurrent(current + 1)}>
          下一步
        </Button>
      </div>
      <Steps items={items} current={1} direction="vertical" status="error" size="sm" />
    </div>
  );
}
