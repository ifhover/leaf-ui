import { Button, type StepItem, Steps } from '@sudden3/leaf-ui';
import { useState } from 'react';

const items: readonly StepItem[] = [
  { title: 'Create project', description: 'Enter basic information' },
  { title: 'Review settings', description: 'Review project information' },
  { title: 'Done', description: 'Get started' },
];
export function StepsBasic() {
  const [current, setCurrent] = useState(1);
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Interactive steps</span>
        <Steps items={items} current={current} onChange={setCurrent} />
      </div>
      <div className="leaf-demo-row">
        <Button variant="outline" disabled={current === 0} onClick={() => setCurrent(current - 1)}>
          Previous
        </Button>
        <Button disabled={current === 2} onClick={() => setCurrent(current + 1)}>
          Next
        </Button>
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Error feedback</span>
        <Steps items={items} current={1} direction="vertical" status="error" size="sm" />
      </div>
    </div>
  );
}
