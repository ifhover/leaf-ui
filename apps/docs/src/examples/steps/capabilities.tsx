import { Space, Steps } from '@sudden3/leaf-ui';

const items = [{ title: 'Create' }, { title: 'Review' }, { title: 'Publish' }];
export function Capabilities({ english = false }) {
  return (
    <Space direction="vertical" align="stretch">
      <div>
        <p style={{ margin: '0 0 8px' }}>{english ? 'Dot steps' : '点状步骤'}</p>
        <Steps progressDot current={1} items={items} />
      </div>
      <div>
        <p style={{ margin: '0 0 8px' }}>
          {english ? 'Progress within the current step' : '当前步骤的进度'}
        </p>
        <Steps current={1} percent={65} items={items} />
      </div>
    </Space>
  );
}
